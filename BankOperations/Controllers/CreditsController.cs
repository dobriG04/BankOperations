using BankOperations.Data;
using BankOperations.Models;
using BankOperations.Models.Enums;
using BankOperations.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BankOperations.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class CreditsController : ControllerBase
	{
		private readonly ICreditService _creditService;
		private readonly ApplicationDbContext _context;

		public CreditsController(ICreditService creditService, ApplicationDbContext context)
		{
			_creditService = creditService;
			_context = context;
		}

		// POST: api/credits
		[HttpPost]
		public IActionResult Create([FromBody] CreateCreditRequest request)
		{
			if (request.Amount <= 0 || request.DurationInMonths <= 0)
			{
				return BadRequest(new { message = "Please enter valid positive values." });
			}

			var credit = _creditService.CreateCredit(request.ClientId, request.Type, request.Amount, request.DurationInMonths);

			return CreatedAtAction(nameof(GetDetails), new { id = credit.Id }, credit);
		}

		// GET: api/credits/5
		[HttpGet("{id}")]
		public IActionResult GetDetails(int id)
		{
			var credit = _context.Credits
				.Include(c => c.Client)
				.Include(c => c.Installments)
				.FirstOrDefault(c => c.Id == id);

			if (credit == null)
			{
				return NotFound(new { message = "Credit not found." });
			}

			return Ok(credit);
		}

		// POST: api/credits/pay
		[HttpPost("pay")]
		public IActionResult PayInstallment([FromBody] PayInstallmentRequest request)
		{
			_creditService.PayInstallment(request.InstallmentId);

			return Ok(new { message = "Installment paid successfully!" });
		}
	}

	public class CreateCreditRequest
	{
		public int ClientId { get; set; }
		public CreditType Type { get; set; }
		public decimal Amount { get; set; }
		public int DurationInMonths { get; set; }
	}

	public class PayInstallmentRequest
	{
		public int InstallmentId { get; set; }
		public int AccountId { get; set; }
	}
}