using BankOperations.Controllers;
using BankOperations.Data;
using BankOperations.Models;
using BankOperations.Models.Enums;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace BankOperations.Tests
{
	public class BankAccountsControllerTests
	{
		private ApplicationDbContext GetInMemoryDbContext()
		{
			var options = new DbContextOptionsBuilder<ApplicationDbContext>()
				.UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
				.Options;
			return new ApplicationDbContext(options);
		}

		[Fact]
		public void CreateAccount_ShouldGenerate22CharIban_AndSaveAccount()
		{
			// Arrange
			var context = GetInMemoryDbContext();

			var client = new PhysicalPerson { FirstName = "Ivan", LastName = "Ivanov", EGN = "123", Email = "test@test.bg", PhoneNumber = "123" };
			context.Clients.Add(client);
			context.SaveChanges();

			var controller = new BankAccountsController(context);
			var request = new CreateAccountRequest { ClientId = client.Id, InitialBalance = 500m };

			// Act
			var result = controller.CreateAccount(request);

			// Assert
			Assert.IsType<OkObjectResult>(result);

			var savedAccount = context.BankAccounts.FirstOrDefault();
			Assert.NotNull(savedAccount);
			Assert.Equal(500m, savedAccount.Balance);
			Assert.Equal(AccountStatus.Active, savedAccount.Status);
			Assert.Equal(22, savedAccount.IBAN.Length);
			Assert.StartsWith("BG", savedAccount.IBAN);
		}

		[Fact]
		public void CloseAccount_WithPositiveBalance_ShouldReturnBadRequest()
		{
			// Arrange
			var context = GetInMemoryDbContext();
			var account = new BankAccount { IBAN = "BG12345678901234567890", Balance = 100m, Status = AccountStatus.Active, ClientId = 1 };
			context.BankAccounts.Add(account);
			context.SaveChanges();

			var controller = new BankAccountsController(context);

			// Act
			var result = controller.CloseAccount(account.Id);

			// Assert
			var badRequestResult = Assert.IsType<BadRequestObjectResult>(result); 
			var dbAccount = context.BankAccounts.Find(account.Id);
			Assert.Equal(AccountStatus.Active, dbAccount!.Status); 
		}

		[Fact]
		public void CloseAccount_WithZeroBalance_ShouldChangeStatusToClosed()
		{
			// Arrange
			var context = GetInMemoryDbContext();
			var account = new BankAccount { IBAN = "BG12345678901234567890", Balance = 0m, Status = AccountStatus.Active, ClientId = 1 };
			context.BankAccounts.Add(account);
			context.SaveChanges();

			var controller = new BankAccountsController(context);

			// Act
			var result = controller.CloseAccount(account.Id);

			// Assert
			Assert.IsType<OkObjectResult>(result);
			var dbAccount = context.BankAccounts.Find(account.Id);
			Assert.Equal(AccountStatus.Closed, dbAccount!.Status); 
		}
	}
}