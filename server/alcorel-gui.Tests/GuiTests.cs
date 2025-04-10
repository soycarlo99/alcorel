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
                Headless = false,
                SlowMo = 500, // Lägger in en fördröjning så vi kan se vad som händer
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
    public async Task Login()
    {
        await _page.GotoAsync("http://localhost:5001/");
        await _page.GetByRole(AriaRole.Link, new() { Name = "log-in for businesses" }).ClickAsync();
        await _page.GetByRole(AriaRole.Textbox, new() { Name = "Email" }).ClickAsync();
        await _page.GetByRole(AriaRole.Textbox, new() { Name = "Email" }).FillAsync("cj@cj.com");
        await _page.GetByRole(AriaRole.Textbox, new() { Name = "Password" }).ClickAsync();
        await _page.GetByRole(AriaRole.Textbox, new() { Name = "Password" }).FillAsync("1");
        await _page.GetByRole(AriaRole.Button, new() { Name = "Login" }).ClickAsync();
    }

    [TestMethod]
    public async Task NavTesting()
    {
        await _page.GotoAsync("http://localhost:5001/");
        await _page.GetByRole(AriaRole.Link, new() { Name = "log-in for businesses" }).ClickAsync();
        await _page.GetByRole(AriaRole.Textbox, new() { Name = "Email" }).ClickAsync();
        await _page.GetByRole(AriaRole.Textbox, new() { Name = "Email" }).FillAsync("cj@cj.com");
        await _page.GetByRole(AriaRole.Textbox, new() { Name = "Password" }).ClickAsync();
        await _page.GetByRole(AriaRole.Textbox, new() { Name = "Password" }).FillAsync("1");
        await _page.GetByRole(AriaRole.Button, new() { Name = "Login" }).ClickAsync();
        await _page.GetByRole(AriaRole.Link, new() { Name = "Dashboard" }).ClickAsync();
        await _page.GetByRole(AriaRole.Link, new() { Name = "Edit Categories" }).ClickAsync();
        await _page
            .GetByRole(AriaRole.Textbox, new() { Name = "Please enter new category" })
            .ClickAsync();
        await _page
            .GetByRole(AriaRole.Textbox, new() { Name = "Please enter new category" })
            .FillAsync("test");
        await _page.GetByRole(AriaRole.Button, new() { Name = "ADD" }).ClickAsync();
        await _page
            .Locator("div")
            .Filter(new() { HasTextRegex = new Regex("^-test✎$") })
            .GetByRole(AriaRole.Button)
            .Nth(1)
            .ClickAsync();
        await _page.Locator("input[name=\"Cat\"]").ClickAsync();
        await _page.Locator("input[name=\"Cat\"]").FillAsync("testedit");
        await _page.GetByRole(AriaRole.Button, new() { Name = "✓" }).ClickAsync();
        await _page
            .Locator("div")
            .Filter(new() { HasTextRegex = new Regex("^-testedit✎$") })
            .GetByRole(AriaRole.Button)
            .First.ClickAsync();
        await _page.GetByRole(AriaRole.Link, new() { Name = "Tickets" }).ClickAsync();
        await _page.GetByRole(AriaRole.Button, new() { Name = "ID ↕️" }).ClickAsync();
        await _page.GetByRole(AriaRole.Button, new() { Name = "Date ↕️" }).ClickAsync();
        await _page.GetByRole(AriaRole.Link, new() { Name = "Add Questions" }).ClickAsync();
        await _page
            .Locator("div")
            .Filter(
                new()
                {
                    HasTextRegex = new Regex(
                        "^Select Category to ViewOtherLawhardwareSoftware testDelivery$"
                    ),
                }
            )
            .GetByRole(AriaRole.Combobox)
            .SelectOptionAsync(new[] { "15" });
        await _page.GetByRole(AriaRole.Link, new() { Name = "Manage Employee" }).ClickAsync();
    }
}
