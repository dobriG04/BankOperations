using BankOperations.Models;
using BankOperations.Models.Enums;

namespace BankOperations.Services
{
	public interface ICreditService
	{
		Credit CreateCredit(int clientId, CreditType type, decimal amount, int durationInMonths);

		List<Installment> GenerateRepaymentPlan(decimal amount, int durationInMonths, decimal annualInterestRate);

		void PayInstallment(int installmentId);
	}
}
