using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// SQLite DB (file-based) for persistence during development
var dbPath = Path.Combine(builder.Environment.ContentRootPath, "jobportal.db");
builder.Services.AddDbContext<AppDbContext>(opt => opt.UseSqlite($"Data Source={dbPath}"));

builder.Services.AddControllers();
builder.Services.AddRazorPages();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS - allow the Vite frontend during development
var corsPolicyName = "AllowFrontend";
builder.Services.AddCors(options =>
{
    options.AddPolicy(corsPolicyName, policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Simple JWT config
// NOTE: HMAC-SHA256 requires a signing key of at least 256 bits (32 bytes).
// Use an environment variable Jwt:Key in production. The default below is long enough for development.
var jwtKey = builder.Configuration["Jwt:Key"] ?? "dev_secret_key_change_in_production_make_it_longer_please!";
var issuer = builder.Configuration["Jwt:Issuer"] ?? "jobportal";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = issuer,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddAuthorization();

// Cookie auth for server-rendered Razor Pages (simple scheme using Users DB)
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
    .AddCookie("Cookies", options =>
    {
        options.LoginPath = "/Account/Login";
        options.Cookie.Name = "JobPortalAuth";
    });

var app = builder.Build();

// Enhanced logging for startup/shutdown and unhandled exceptions
var logger = app.Services.GetRequiredService<ILogger<Program>>();
logger.LogInformation("Starting JobPortalApi; Environment={env}; ContentRoot={root}", app.Environment.EnvironmentName, app.Environment.ContentRootPath);
AppDomain.CurrentDomain.UnhandledException += (s, e) =>
{
    // Logger may be disposed during shutdown, so write to Console as a fallback.
    try
    {
        logger.LogCritical(e.ExceptionObject as Exception, "Unhandled exception - terminating");
    }
    catch
    {
        Console.WriteLine("Unhandled exception: " + (e.ExceptionObject as Exception)?.ToString());
    }
};
AppDomain.CurrentDomain.ProcessExit += (s, e) =>
{
    // Avoid using logger here because it may be disposed. Use Console to record the event.
    try
    {
        Console.WriteLine("ProcessExit called");
    }
    catch { }
};
app.Lifetime.ApplicationStarted.Register(() => logger.LogInformation("ApplicationStarted event triggered. PID={pid}", Environment.ProcessId));
app.Lifetime.ApplicationStopping.Register(() => logger.LogWarning("ApplicationStopping event triggered."));

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Serve default wwwroot if present
app.UseStaticFiles();

// Enable routing for Razor Pages
app.UseRouting();

// Also serve uploaded resumes from /uploads
var uploadsPath = Path.Combine(app.Environment.ContentRootPath, "uploads");
if (!Directory.Exists(uploadsPath)) Directory.CreateDirectory(uploadsPath);
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploadsPath),
    RequestPath = "/uploads"
});

app.UseCors(corsPolicyName);
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapRazorPages();

// Seed some sample data
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    // Apply any pending migrations and create the SQLite DB if necessary
    db.Database.Migrate();

    if (!db.Jobs.Any())
    {
        db.Jobs.Add(new Job { Id = Guid.NewGuid(), Title = "Frontend Developer", Description = "Build UI", Location = "Remote", EmployerName = "Acme Inc.", PostedDate = DateTime.UtcNow });
        db.Jobs.Add(new Job { Id = Guid.NewGuid(), Title = "Backend Developer", Description = "Build APIs", Location = "New York", EmployerName = "Beta LLC", PostedDate = DateTime.UtcNow });
        db.SaveChanges();
    }
}

try
{
    app.Run();
}
catch (Exception ex)
{
    logger.LogCritical(ex, "Host terminated unexpectedly");
    throw;
}
