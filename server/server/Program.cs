using Npgsql;
using Server;

var builder = WebApplication.CreateBuilder(args);

string host = "localhost";
string port = "5432";
string username = "postgres";
string password = "postgres";
string database = "alcorel1";

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
//app.MapPost("/api/ticketsJoin", TicketRoutes.GetTicketsJoined);
app.MapGet("/api/DetailedTicket", TicketRoutes.GetDetailedTickets);




//Question APIs
app.MapGet("/api/questions/{category_id}", QuestionRoutes.GetQuestion);
app.MapPost("/api/questions", QuestionRoutes.PostQuestions);
app.MapDelete("/api/questions/{id}", QuestionRoutes.DeleteQuestion);




app.Run();
