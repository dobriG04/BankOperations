using BankOperations.Data;
using BankOperations.Models;
using BankOperations.Models.Enums;
using BankOperations.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace BankOperations.Tests
{
	public class CreditServiceTests
	{
		
		private ApplicationDbContext GetInMemoryDbContext()
		{
			var options = new DbContextOptionsBuilder<ApplicationDbContext>()
				.UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
				.Options;

			return new ApplicationDbContext(options);
		}

		[Fact]
		public void GenerateRepaymentPlan_ShouldCalculateAnnuityCorrectly()
		{
			// Arrange
			var context = GetInMemoryDbContext();
			var service = new CreditService(context);
			decimal amount = 10000m;
			int duration = 12;
			decimal interestRate = 10.5m;

			// Act
			var plan = service.GenerateRepaymentPlan(amount, duration, interestRate);

			// Assert
			Assert.NotNull(plan);
			Assert.Equal(duration, plan.Count); 

			var firstInstallment = plan.First();
			Assert.Equal(1, firstInstallment.MonthNumber);
			Assert.True(firstInstallment.TotalAmount > 0);
			Assert.Equal(firstInstallment.TotalAmount, firstInstallment.PrincipalPart + firstInstallment.InterestPart); // Главница + Лихва = Вноска

			var lastInstallment = plan.Last();
			Assert.Equal(duration, lastInstallment.MonthNumber);
			Assert.Equal(0, lastInstallment.RemainingBalance);
		}

		[Fact]
		public void CreateCredit_ShouldSaveCreditAndInstallmentsInDatabase()
		{
			// Arrange
			var context = GetInMemoryDbContext();
			var service = new CreditService(context);

			var client = new PhysicalPerson { FirstName = "Test", LastName = "Testov", EGN = "0000000000", Email = "test@test.bg", PhoneNumber = "123" };
			context.Clients.Add(client);
			context.SaveChanges();

			// Act
			var credit = service.CreateCredit(client.Id, CreditType.Consumer, 5000, 24);

			// Assert
			Assert.NotEqual(0, credit.Id); 
			Assert.Equal(5000, credit.Amount);
			Assert.Equal(24, credit.DurationInMonths);

			var savedCredit = context.Credits.Include(c => c.Installments).FirstOrDefault(c => c.Id == credit.Id);
			Assert.NotNull(savedCredit);
			Assert.Equal(24, savedCredit.Installments.Count); 
		}

		[Fact]
		public void PayInstallment_ShouldUpdateIsPaidStatus()
		{
			// Arrange
			var context = GetInMemoryDbContext();
			var service = new CreditService(context);

			var installment = new Installment
			{
				MonthNumber = 1,
				TotalAmount = 100,
				PrincipalPart = 90,
				InterestPart = 10,
				RemainingBalance = 900,
				isPaid = false
			};
			context.Installments.Add(installment);
			context.SaveChanges();

			// Act
			service.PayInstallment(installment.Id);

			// Assert
			var updatedInstallment = context.Installments.Find(installment.Id);
			Assert.True(updatedInstallment!.isPaid); 
		}

		[Fact]
		public void PayInstallment_ShouldNotFail_WhenInstallmentAlreadyPaid()
		{
			// Arrange
			var context = GetInMemoryDbContext();
			var service = new CreditService(context);

			var installment = new Installment
			{
				MonthNumber = 1,
				TotalAmount = 100,
				PrincipalPart = 90,
				InterestPart = 10,
				RemainingBalance = 900,
				isPaid = true 
			};
			context.Installments.Add(installment);
			context.SaveChanges();

			// Act
			service.PayInstallment(installment.Id);

			// Assert
			var updatedInstallment = context.Installments.Find(installment.Id);
			Assert.True(updatedInstallment!.isPaid); 
		}
	}
}