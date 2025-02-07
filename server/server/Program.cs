using Microsoft.AspNetCore.Mvc;
using Npgsql;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddScoped<Database>();
builder.Services.AddScoped<ServerService>();

var app = builder.Build();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder =>
        {
            builder
                .AllowAnyOrigin()
                .AllowAnyMethod()
                .AllowAnyHeader();
        });
});
app.UseCors("AllowAll");
app.MapGet("/api/user", async (ServerService serverService) =>
    await serverService.GetUsersAsync());

app.Run();



public class User
{
    public string Name { get; set; } = string.Empty;
}

public class ServerService
{
    private readonly Database _database;


    public ServerService(Database database)
    {
        _database = database;
    }

    public async Task<List<User>> GetUsersAsync()
    {
        var users = new List<User>();
    
        using var conn = _database.Connection().CreateConnection();
        await conn.OpenAsync();
    
        using var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT name FROM testuser";
    
        using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            users.Add(new User
            {
                Name = reader.GetString(0)
            });
        }
        //Console.WriteLine(Name);
        
        return users;
    }
}
