using Npgsql;
using Server;

var builder = WebApplication.CreateBuilder(args);

var host = builder.Configuration["PG_HOST"] ?? "localhost";
var port = builder.Configuration["PG_PORT"] ?? "5432";
var username = builder.Configuration["PG_USER"] ?? "postgres";
var password = builder.Configuration["PG_PASSWORD"] ?? "ostmacka666";
var database = builder.Configuration["PG_DATABASE"] ?? "alcorel1";

var dataSourceBuilder = new NpgsqlDataSourceBuilder($"Host={host};Port={port};Username={username};Password={password};Database={database}");
dataSourceBuilder.EnableUnmappedTypes();
var databaseBuilder = dataSourceBuilder.Build();

builder.Services.AddSingleton<NpgsqlDataSource>(databaseBuilder);

builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options => { options.Cookie.IsEssential = true; });

var emailSettings = builder.Configuration.GetSection("Email").Get<EmailSettings>();
if (emailSettings != null)
{
    builder.Services.AddSingleton(emailSettings);
}
else
{
    throw new InvalidOperationException("Email settings are not configured properly.");
}

builder.Services.AddScoped<IEmailService, EmailService>();

var app = builder.Build();

app.MapPost("/api/email", SendEmail);

static async Task<IResult> SendEmail(EmailRequest request, IEmailService email)
{
    Console.WriteLine("SendEmail is called..Sending email");

    await email.SendEmailAsync(request.To, request.Subject, request.Body);

    Console.WriteLine("Email sent to: " + request.To + " with subject: " + request.Subject + " and body: " + request.Body);
    return Results.Ok(new { message = "Email sent." });
}

await app.RunAsync();

app.UseSession();



//User APIs
app.MapGet("/api/users", UserRoutes.GetUsers);
//app.MapPost("/api/users", UserRoutes.PostUser);
//app.MapPost("/api/login", UserRoutes.CheckCredentials);
app.MapPost("/api/createusers", UserRoutes.CreationOfTicket);
app.MapPost("/api/login", UserRoutes.Post);
app.MapPost("/api/customersesh", UserRoutes.CustomerVisit);
app.MapGet("/api/ticket/token/{token}", TicketRoutes.GetTicketByToken);
app.MapGet("/api/company/{companyId}/init", (int companyId, HttpContext ctx) => {
    ctx.Session.SetInt32("companyId", companyId);
    return TypedResults.Ok(new { success = true });
});

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
app.MapGet("/api/GetCategory/{categoryId}", CategoryRoutes.GetCategoriesById);
app.MapPost("/api/PostCategory", CategoryRoutes.PostCategory);
app.MapDelete("/api/DeleteCategory/{categoryId}", CategoryRoutes.RemoveCategory);

//Message APIs
app.MapPost("/api/{id}/message", MessageRoutes.PostMessage);
app.MapPost("/api/{ticketId}/{questionId}/postAnswer", AnswerRoutes.PostAnswer);

//Employee APIs
app.MapGet("/api/GetEmployee", EmployeeRoutes.GetEmployee);
app.MapPost("/api/PostEmployee", EmployeeRoutes.PostEmployee);
app.MapDelete("/api/DeleteEmployee/{testuserId}", EmployeeRoutes.RemoveEmployee);
app.MapPut("/api/ResetPassword/{testuserId}", EmployeeRoutes.ResetPassword);

app.Run();
