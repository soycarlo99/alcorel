using System.Text.RegularExpressions;
using Microsoft.Playwright;
using Microsoft.Playwright.MSTest;

namespace PlaywrightTests;

[TestClass]
public class GuiTest : PageTest
{
    private IPlaywright _playwright;
    private IBrowser _browser;
    private IBrowserContext _browserContext;
    private IPage _page;

    [TestInitialize]
    public async Task Setup()
    {
        _playwright = await Microsoft.Playwright.Playwright.CreateAsync();
        _browser = await _playwright.Chromium.LaunchAsync(
            new BrowserTypeLaunchOptions
            {
                Headless = true,
                // SlowMo = 500, // Lägger in en fördröjning så vi kan se vad som händer
            }
        );
        _browserContext = await _browser.NewContextAsync();
        _page = await _browserContext.NewPageAsync();
    }

    [TestCleanup]
    public async Task Cleanup()
    {
        await _browserContext.CloseAsync();
        await _browser.CloseAsync();
        _playwright.Dispose();
    }

    [TestMethod]
    public async Task createCompany()
    {
        await _page.GotoAsync("http://localhost:5001/alcorel");
        await _page.GetByRole(AriaRole.Textbox, new() { Name = "Company Name" }).ClickAsync();
        await _page
            .GetByRole(AriaRole.Textbox, new() { Name = "Company Name" })
            .FillAsync("testcompany");
        await _page
            .GetByRole(AriaRole.Textbox, new() { Name = "Organization Number" })
            .ClickAsync();
        await _page
            .GetByRole(AriaRole.Textbox, new() { Name = "Organization Number" })
            .FillAsync("123456");
        await _page.GetByRole(AriaRole.Textbox, new() { Name = "Admin Name" }).ClickAsync();
        await _page
            .GetByRole(AriaRole.Textbox, new() { Name = "Admin Name" })
            .FillAsync("test testsson");
        await _page.GetByRole(AriaRole.Textbox, new() { Name = "Email" }).ClickAsync();
        await _page
            .GetByRole(AriaRole.Textbox, new() { Name = "Email" })
            .FillAsync("testament@test.com");
        await _page.GetByRole(AriaRole.Textbox, new() { Name = "Password" }).ClickAsync();
        await _page.GetByRole(AriaRole.Textbox, new() { Name = "Password" }).FillAsync("testtest");
        await _page.GetByRole(AriaRole.Button, new() { Name = "Create Account" }).ClickAsync();
        await Expect(_page.GetByRole(AriaRole.Heading, new() { Name = "Login" }))
            .ToBeVisibleAsync();
    }

    [TestMethod]
    public async Task Login()
    {
        await _page.GotoAsync("http://localhost:5001/");
        await _page.GetByRole(AriaRole.Link, new() { Name = "log-in for businesses" }).ClickAsync();
        await _page.GetByRole(AriaRole.Textbox, new() { Name = "Email" }).ClickAsync();
        await _page
            .GetByRole(AriaRole.Textbox, new() { Name = "Email" })
            .FillAsync("testament@test.com");
        await _page.GetByRole(AriaRole.Textbox, new() { Name = "Password" }).ClickAsync();
        await _page.GetByRole(AriaRole.Textbox, new() { Name = "Password" }).FillAsync("testtest");
        await _page.GetByRole(AriaRole.Button, new() { Name = "Login" }).ClickAsync();
    }

    [TestMethod]
    public async Task navibarextensivetesting()
    {
        await _page.GotoAsync("http://localhost:5001/");
        await _page.GetByRole(AriaRole.Link, new() { Name = "log-in for businesses" }).ClickAsync();
        await _page.GetByRole(AriaRole.Textbox, new() { Name = "Email" }).ClickAsync();
        await _page
            .GetByRole(AriaRole.Textbox, new() { Name = "Email" })
            .FillAsync("testament@test.com");
        await _page.GetByRole(AriaRole.Textbox, new() { Name = "Password" }).ClickAsync();
        await _page.GetByRole(AriaRole.Textbox, new() { Name = "Password" }).FillAsync("testtest");
        await _page.GetByRole(AriaRole.Button, new() { Name = "Login" }).ClickAsync();
        await _page.Locator("#logotype_url").ClickAsync(new LocatorClickOptions { Timeout = 2000 });
        await _page
            .Locator("#logotype_url")
            .FillAsync(
                "https://cpmr-islands.org/wp-content/uploads/sites/4/2019/07/Test-Logo-Small-Black-transparent-1.png"
            );
        await _page.GetByRole(AriaRole.Button, new() { Name = "Submit Link" }).ClickAsync();
        await _page.GetByRole(AriaRole.Link, new() { Name = "Edit Categories" }).ClickAsync();
        await _page.GetByRole(AriaRole.Link, new() { Name = "Dashboard" }).ClickAsync();
        await Expect(_page.GetByRole(AriaRole.Img, new() { Name = "Your Company's logo" }))
            .ToBeVisibleAsync();
        await _page.GetByRole(AriaRole.Img, new() { Name = "Your Company's logo" }).ClickAsync();
        await _page.GetByRole(AriaRole.Link, new() { Name = "Edit Categories" }).ClickAsync();
        await _page
            .GetByRole(AriaRole.Textbox, new() { Name = "Please enter new category" })
            .ClickAsync();
        await _page
            .GetByRole(AriaRole.Textbox, new() { Name = "Please enter new category" })
            .FillAsync("test");
        await _page.GetByRole(AriaRole.Button, new() { Name = "ADD" }).ClickAsync();
        await _page.GetByRole(AriaRole.Button, new() { Name = "✎" }).Nth(4).ClickAsync();
        await _page.Locator("input[name=\"Cat\"]").ClickAsync();
        await _page.Locator("input[name=\"Cat\"]").FillAsync("testtest");
        await _page.GetByRole(AriaRole.Button, new() { Name = "✓" }).ClickAsync();
        await _page.GetByRole(AriaRole.Button, new() { Name = "-" }).Nth(4).ClickAsync();
        await _page.GetByRole(AriaRole.Link, new() { Name = "Tickets" }).ClickAsync();
        await _page.GetByRole(AriaRole.Link, new() { Name = "Add Questions" }).ClickAsync();
        await _page.GetByRole(AriaRole.Link, new() { Name = "Add Questions" }).ClickAsync();
        await _page.Locator("select").Nth(0).SelectOptionAsync(new[] { "180" });
        await _page.GetByPlaceholder("New question").FillAsync("testquestion");
        await _page.Locator("select[name=\"category_id\"]").SelectOptionAsync(new[] { "180" });
        await _page.GetByRole(AriaRole.Button, new() { Name = "Add Question" }).ClickAsync();
        await _page.GetByRole(AriaRole.Button, new() { Name = "✎" }).Nth(0).ClickAsync();
        await _page.Locator("input[name=\"question\"]").FillAsync("testquestionstest");
        await _page.GetByRole(AriaRole.Button, new() { Name = "✓" }).ClickAsync();
        await _page.GetByRole(AriaRole.Button, new() { Name = "-" }).Nth(0).ClickAsync();
        await _page
            .Locator("select[name=\"category_id\"]")
            .SelectOptionAsync(new SelectOptionValue[] { new SelectOptionValue { Index = 0 } });
        await _page.GetByPlaceholder("New question").FillAsync("testquestion");
        await _page.GetByRole(AriaRole.Button, new() { Name = "Add Question" }).ClickAsync();
        await _page.GetByRole(AriaRole.Link, new() { Name = "Manage Employee" }).ClickAsync();
        await _page
            .GetByRole(AriaRole.Textbox, new() { Name = "enter new employee's name" })
            .ClickAsync();
        await _page
            .GetByRole(AriaRole.Textbox, new() { Name = "enter new employee's name" })
            .FillAsync("test testsson");
        await _page
            .GetByRole(AriaRole.Textbox, new() { Name = "enter new employee's email" })
            .ClickAsync();
        await _page
            .GetByRole(AriaRole.Textbox, new() { Name = "enter new employee's email" })
            .FillAsync("test@testsson.com");
        await _page.GetByRole(AriaRole.Button, new() { Name = "Add employee" }).ClickAsync();
        await _page.GetByRole(AriaRole.Button, new() { Name = "-" }).ClickAsync();
        await _page.GetByRole(AriaRole.Link, new() { Name = "log-out ⏻" }).ClickAsync();
    }

    // [TestMethod]
    // public async Task NavTesting()
    // {
    //     await _page.GotoAsync("http://localhost:5001/");
    //     await _page.GetByRole(AriaRole.Link, new() { Name = "log-in for businesses" }).ClickAsync();
    //     await _page.GetByRole(AriaRole.Textbox, new() { Name = "Email" }).ClickAsync();
    //     await _page
    //         .GetByRole(AriaRole.Textbox, new() { Name = "Email" })
    //         .FillAsync("testament@test.com");
    //     await _page.GetByRole(AriaRole.Textbox, new() { Name = "Password" }).ClickAsync();
    //     await _page.GetByRole(AriaRole.Textbox, new() { Name = "Password" }).FillAsync("testtest");
    //     await _page.GetByRole(AriaRole.Button, new() { Name = "Login" }).ClickAsync();
    //     await _page.GetByRole(AriaRole.Link, new() { Name = "Dashboard" }).ClickAsync();
    //     await _page.GetByRole(AriaRole.Link, new() { Name = "Edit Categories" }).ClickAsync();
    //     await _page
    //         .GetByRole(AriaRole.Textbox, new() { Name = "Please enter new category" })
    //         .ClickAsync();
    //     await _page
    //         .GetByRole(AriaRole.Textbox, new() { Name = "Please enter new category" })
    //         .FillAsync("test");
    //     await _page.GetByRole(AriaRole.Button, new() { Name = "ADD" }).ClickAsync();
    //     await _page
    //         .Locator("div")
    //         .Filter(new() { HasTextRegex = new Regex("^-test✎$") })
    //         .GetByRole(AriaRole.Button)
    //         .Nth(1)
    //         .ClickAsync();
    //     await _page.Locator("input[name=\"Cat\"]").ClickAsync();
    //     await _page.Locator("input[name=\"Cat\"]").FillAsync("testedit");
    //     await _page.GetByRole(AriaRole.Button, new() { Name = "✓" }).ClickAsync();
    //     await _page
    //         .Locator("div")
    //         .Filter(new() { HasTextRegex = new Regex("^-testedit✎$") })
    //         .GetByRole(AriaRole.Button)
    //         .First.ClickAsync();
    //     await _page
    //         .GetByRole(AriaRole.Textbox, new() { Name = "Please enter new category" })
    //         .ClickAsync();
    //     await _page
    //         .GetByRole(AriaRole.Textbox, new() { Name = "Please enter new category" })
    //         .FillAsync("customertest");
    //     await _page.GetByRole(AriaRole.Button, new() { Name = "ADD" }).ClickAsync();
    //
    //     await _page.GetByRole(AriaRole.Link, new() { Name = "Tickets" }).ClickAsync();
    //     await _page.GetByRole(AriaRole.Button, new() { Name = "ID ↕️" }).ClickAsync();
    //     await _page.GetByRole(AriaRole.Button, new() { Name = "Date ↕️" }).ClickAsync();
    //     await _page.GetByRole(AriaRole.Link, new() { Name = "Add Questions" }).ClickAsync();
    //     await _page
    //         .Locator("div")
    //         .Filter(
    //             new()
    //             {
    //                 HasTextRegex = new Regex(
    //                     "^Select Category to ViewOtherLawhardwareSoftware testDelivery$"
    //                 ),
    //             }
    //         )
    //         .GetByRole(AriaRole.Combobox)
    //         .SelectOptionAsync(new[] { "15" });
    //     await _page.GetByRole(AriaRole.Link, new() { Name = "Manage Employee" }).ClickAsync();
    // }

    [TestMethod]
    public async Task ticketCreation()
    {
        await _page.GotoAsync("http://localhost:5001/company/11");
        await _page
            .GetByRole(AriaRole.Textbox, new() { Name = "Enter your name:" })
            .FillAsync("test");
        await _page
            .GetByRole(AriaRole.Textbox, new() { Name = "Enter your name:" })
            .PressAsync("Tab");
        await _page
            .GetByRole(AriaRole.Textbox, new() { Name = "Enter your email:" })
            .FillAsync("cj@cj.com");
        await _page
            .GetByRole(AriaRole.Textbox, new() { Name = "Enter your email:" })
            .PressAsync("Tab");
        await _page
            .GetByRole(AriaRole.Textbox, new() { Name = "Enter your Message:" })
            .FillAsync("test ticket");
        await _page
            .GetByRole(AriaRole.Textbox, new() { Name = "Enter your Message:" })
            .PressAsync("Tab");
        await _page.GetByLabel("Choose a category:").PressAsync("ArrowDown");
        await _page
            .GetByLabel("Choose a category:")
            .SelectOptionAsync(new SelectOptionValue { Label = "Öl" });
        await _page.GetByRole(AriaRole.Button, new() { Name = "Submit" }).ClickAsync();
        await Expect(_page.GetByRole(AriaRole.Main))
            .ToContainTextAsync("Ticket created successfully!");
    }

    [TestMethod]
    public async Task createEmployee()
    {
        await _page.GotoAsync("http://localhost:5001/");
        await _page.GetByRole(AriaRole.Link, new() { Name = "log-in for businesses" }).ClickAsync();
        await _page.GetByRole(AriaRole.Textbox, new() { Name = "Email" }).ClickAsync();
        await _page
            .GetByRole(AriaRole.Textbox, new() { Name = "Email" })
            .FillAsync("testament@test.com");
        await _page.GetByRole(AriaRole.Textbox, new() { Name = "Password" }).ClickAsync();
        await _page.GetByRole(AriaRole.Textbox, new() { Name = "Password" }).FillAsync("testtest");
        await _page.GetByRole(AriaRole.Button, new() { Name = "Login" }).ClickAsync();
        await _page.GetByRole(AriaRole.Link, new() { Name = "Edit Categories" }).ClickAsync();
        await _page.GetByRole(AriaRole.Link, new() { Name = "Tickets" }).ClickAsync();
        await _page.GetByRole(AriaRole.Link, new() { Name = "Add Questions" }).ClickAsync();
        await _page.GetByRole(AriaRole.Link, new() { Name = "Manage Employee" }).ClickAsync();
        await _page
            .GetByRole(AriaRole.Textbox, new() { Name = "enter new employee's name" })
            .ClickAsync();
        await _page
            .GetByRole(AriaRole.Textbox, new() { Name = "enter new employee's name" })
            .FillAsync("test testsson");
        await _page
            .GetByRole(AriaRole.Textbox, new() { Name = "enter new employee's name" })
            .PressAsync("Tab");
        await _page
            .GetByRole(AriaRole.Textbox, new() { Name = "enter new employee's email" })
            .FillAsync("test@testsson.com");
        await _page.GetByRole(AriaRole.Button, new() { Name = "Add employee" }).ClickAsync();
        await _page.GetByTitle("Eliminate test testsson").ClickAsync();
    }
}
