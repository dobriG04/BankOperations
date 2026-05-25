using BankOperations.Data;
using BankOperations.Models;
using BankOperations.Models.Enums;

namespace BankOperations.Services
{
	public class CreditService : ICreditService
	{
		private readonly ApplicationDbContext _context;

		public CreditService(ApplicationDbContext context)
		{
			_context = context;
		}

		public Credit CreateCredit(int clientId, CreditType type, decimal amount, int durationInMonths)
		{
			decimal annualInterestRate = type == CreditType.Mortgage ? 4.5m : 10.5m;

			var credit = new Credit
			{
				ClientId = clientId,
				Type = type,
				Amount = amount,
				DurationInMonths = durationInMonths,
				Installments = GenerateRepaymentPlan(amount, durationInMonths, annualInterestRate)
			};

			_context.Credits.Add(credit);
			_context.SaveChanges();

			return credit;
		}

		public List<Installment> GenerateRepaymentPlan(decimal amount, int durationInMonths, decimal annualInterestRate)
		{
			var plan = new List<Installment>();

			decimal monthlyInterestRate = (annualInterestRate / 100m) / 12m;

			double rate = (double)monthlyInterestRate;
			double mathAmount = (double)amount;

			double annuityFactor = (rate * Math.Pow(1 + rate, durationInMonths)) / (Math.Pow(1 + rate, durationInMonths) - 1);

			decimal monthlyInstallment = Math.Round((decimal)(mathAmount * annuityFactor), 2);

			decimal remainingBalance = amount;

			for (int i = 1; i <= durationInMonths; i++)
			{
				decimal interestPart = Math.Round(remainingBalance * monthlyInterestRate, 2);

				decimal principalPart = monthlyInstallment - interestPart;

				if (i == durationInMonths)
				{
					principalPart = remainingBalance;
					monthlyInstallment = principalPart + interestPart;
				}

				remainingBalance -= principalPart;

				plan.Add(new Installment
				{
					MonthNumber = i,
					TotalAmount = monthlyInstallment,
					PrincipalPart = principalPart,
					InterestPart = interestPart,
					RemainingBalance = Math.Max(0, remainingBalance),
					isPaid = false
				});
			}

			return plan;
		}

		public void PayInstallment(int installmentId)
		{
			// Търсим вноската по нейния уникален номер (Id)
			var installment = _context.Installments.Find(installmentId);

			// Проверяваме дали съществува и дали вече не е платена
			if (installment != null && !installment.isPaid)
			{
				installment.isPaid = true;
				_context.SaveChanges(); // Запазваме промяната в базата данни
			}
		}
	}
}
