using Npgsql;
using Server;

var builder = WebApplication.CreateBuilder(args);

var host = builder.Configuration["PG_HOST"] ?? "localhost";
var port = builder.Configuration["PG_PORT"] ?? "5432";
var username = builder.Configuration["PG_USER"] ?? "postgres";
var password = builder.Configuration["PG_PASSWORD"] ?? "martinsson123";
var database = builder.Configuration["PG_DATABASE"] ?? "alcorel1";

NpgsqlDataSource db = NpgsqlDataSource.Create($"Host={host};Port={port};Username={username};Password={password};Database={database}");

builder.Services.AddSingleton<NpgsqlDataSource>(db);

var app = builder.Build();



//User APIs
app.MapGet("/api/users", UserRoutes.GetUsers);
//app.MapPost("/api/users", UserRoutes.PostUser);
app.MapPost("/api/login", UserRoutes.CheckCredentials);
app.MapPost("/api/createusers", UserRoutes.CreationOfTicket);



//Ticket APIs
app.MapGet("/api/tickets", TicketRoutes.GetTickets);
app.MapPost("/api/tickets", TicketRoutes.PostTicket);
app.MapPut("/api/tickets/{ticketId}/status", TicketRoutes.UpdateTicketStatus);
app.MapGet("/api/DetailedTicket", TicketRoutes.GetDetailedTickets);
app.MapGet("/api/ticket/{id}", TicketRoutes.GetTicketById);



//Question APIs
app.MapGet("/api/questions/{category_id}", QuestionRoutes.GetQuestion);
app.MapPost("/api/questions", QuestionRoutes.PostQuestions);
app.MapDelete("/api/questions/{id}", QuestionRoutes.DeleteQuestion);



//Category APIs
app.MapGet("/api/GetCategory", CategoryRoutes.GetCategories);
app.MapPost("/api/PostCategory", CategoryRoutes.PostCategory);
app.MapDelete("/api/DeleteCategory/{categoryId}", CategoryRoutes.RemoveCategory);

//Message APIs
app.MapPost("/api/{id}/message", MessageRoutes.PostMessage);
app.MapPost("/api/{ticketId}/{questionId}/postAnswer", AnswerRoutes.PostAnswer);


app.Run();
