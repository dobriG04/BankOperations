using BankOperations.Data;
using BankOperations.Models;
using BankOperations.Models.Enums;
using Microsoft.AspNetCore.Mvc;
using System.Text;

namespace BankOperations.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class BankAccountsController : ControllerBase
	{
		private readonly ApplicationDbContext _context;

		public BankAccountsController(ApplicationDbContext context)
		{
			_context = context;
		}

		// POST: api/bankaccounts
		[HttpPost]
		public IActionResult CreateAccount([FromBody] CreateAccountRequest request)
		{
			var client = _context.Clients.Find(request.ClientId);
			if (client == null)
			{
				return NotFound(new { message = "Client not found." });
			}

			var newAccount = new BankAccount
			{
				ClientId = request.ClientId,
				Balance = request.InitialBalance,
				Status = AccountStatus.Active,
				IBAN = GenerateIban()
			};

			_context.BankAccounts.Add(newAccount);
			_context.SaveChanges();

			return Ok(new { message = "Bank account created successfully!", iban = newAccount.IBAN });
		}

		// POST: api/bankaccounts/{id}/close
		[HttpPost("{id}/close")]
		public IActionResult CloseAccount(int id)
		{
			var account = _context.BankAccounts.Find(id);
			if (account == null)
			{
				return NotFound(new { message = "Account not found." });
			}

			if (account.Balance > 0)
			{
				return BadRequest(new { message = "Cannot close account with positive balance. Please withdraw funds first." });
			}

			account.Status = AccountStatus.Closed;
			_context.SaveChanges();

			return Ok(new { message = "Account closed successfully." });
		}

		private string GenerateIban()
		{
			var random = new Random();
			var iban = new StringBuilder("BG"); 
			iban.Append(random.Next(10, 99));  
			iban.Append("NBUB");             

			for (int i = 0; i < 14; i++)
			{
				iban.Append(random.Next(0, 10));
			}

			return iban.ToString();
		}
	}

	public class CreateAccountRequest
	{
		public int ClientId { get; set; }
		public decimal InitialBalance { get; set; }
	}
}