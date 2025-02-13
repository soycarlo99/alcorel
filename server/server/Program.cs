using Npgsql;
using Server;

var builder = WebApplication.CreateBuilder(args);

string host = "localhost";
string port = "5432";
string username = "postgres";
string password = "Kappa030921";
string database = "alcorel";

NpgsqlDataSource db = NpgsqlDataSource.Create($"Host={host};Port={port};Username={username};Password={password};Database={database}");

builder.Services.AddSingleton<NpgsqlDataSource>(db);

var app = builder.Build();

//User APIs
app.MapGet("/api/users", UserRoutes.GetUsers);
app.MapPost("/api/users", UserRoutes.PostUser);
app.MapPost("/api/login", UserRoutes.CheckCredentials);

//Ticket APIs
app.MapGet("/api/tickets", TicketRoutes.GetTickets);
app.MapPost("/api/tickets", TicketRoutes.PostTicket);
app.MapPut("/api/tickets/{ticketId}/status", TicketRoutes.UpdateTicketStatus);

//

app.Run();
