using Microsoft.AspNetCore.Mvc;
using Npgsql;

var builder = WebApplication.CreateBuilder(args);

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

builder.Services.AddSingleton<Database>();
builder.Services.AddScoped<ServerService>();
var app = builder.Build();

app.UseCors("AllowAll");

app.MapGet("/api/user", async (ServerService serverService) =>
    await serverService.GetUsersAsync());

// app.MapPost("/api/adduser", AddUser);

// app.MapPost("/api/adduser", AddUser());

// app.MapPost("/api/adduser", async (HttpRequest request, ServerService serverService)=> {
//     string Name = await request.ReadFromJsonAsync<name>();
//
// });

app.MapPost("/api/adduser", async (HttpContext context) => {
    // WordRequest here, is a class that defines the post requestBody format
    var requestBody = await context.Request.ReadFromJsonAsync<>();
    if (requestBody?.Word is null)
    {
        return Results.BadRequest("Word is required.");
    }
    bool success = await NewWord(requestBody.Word);
    return success ? Results.Ok("Word added successfully.") : Results.StatusCode(500);
});

app.Run();



    // {
    //     await using var cmd = db.CreateCommand("INSERT INTO words (word, clientid) VALUES ($1, $2)");
    //     cmd.Parameters.AddWithValue(word);
    //     cmd.Parameters.AddWithValue(clientId);
    //     int rowsAffected = await cmd.ExecuteNonQueryAsync(); // Returns the number of rows affected
    //     return rowsAffected > 0; // Return true if the insert was successful
    // }



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

    public void AddUser(string nameFromReact)
    {
        string query = @"
            INSERT INTO customer (name)
            VALUES ($1)
            RETURNING id;";

        using var conn = _database.Connection().CreateConnection();
        conn.OpenAsync();

        using var cmd = new NpgsqlCommand(query, conn);
        cmd.Parameters.AddWithValue(nameFromReact); 
        cmd.ExecuteNonQuery();
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
