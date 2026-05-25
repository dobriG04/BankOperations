using Microsoft.AspNetCore.Mvc;
using BankOperations.Data;
using BankOperations.Models;
using Microsoft.EntityFrameworkCore;

namespace BankOperations.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class ClientsController : ControllerBase
	{
		private readonly ApplicationDbContext _context;

		public ClientsController(ApplicationDbContext context)
		{
			_context = context;
		}

		// GET: api/clients
		[HttpGet]
		public IActionResult GetAllClients()
		{
			var clients = _context.Clients.ToList();
			return Ok(clients);
		}

		// POST: api/clients/physical
		[HttpPost("physical")]
		public IActionResult CreatePhysicalPerson([FromBody] CreatePhysicalPersonRequest request)
		{
			var person = new PhysicalPerson
			{
				Email = request.Email,
				PhoneNumber = request.PhoneNumber,
				FirstName = request.FirstName,
				LastName = request.LastName,
				EGN = request.EGN
			};

			_context.PhysicalPersons.Add(person);
			_context.SaveChanges();

			return Ok(new { message = "Physical person created successfully!", id = person.Id });
		}

		// POST: api/clients/legal
		[HttpPost("legal")]
		public IActionResult CreateLegalEntity([FromBody] CreateLegalEntityRequest request)
		{
			var entity = new LegalEntity
			{
				Email = request.Email,
				PhoneNumber = request.PhoneNumber,
				CompanyName = request.CompanyName,
				EIK = request.EIK,
				RepresentativeName = request.RepresentativeName
			};

			_context.LegalEntities.Add(entity);
			_context.SaveChanges();

			return Ok(new { message = "Legal entity created successfully!", id = entity.Id });
		}

		// GET: api/clients/{id}
		[HttpGet("{id}")]
		public IActionResult GetClientDetails(int id)
		{
			var client = _context.Clients
				.Include(c => c.BankAccounts)
				.Include(c => c.Credits)
				.ThenInclude(cr => cr.Installments)
				.FirstOrDefault(c => c.Id == id);

			if (client == null)
			{
				return NotFound(new { message = "Client not found." });
			}

			return Ok(client);
		}
	}


	public class CreatePhysicalPersonRequest
	{
		public string Email { get; set; } = null!;
		public string PhoneNumber { get; set; } = null!;
		public string FirstName { get; set; } = null!;
		public string LastName { get; set; } = null!;
		public string EGN { get; set; } = null!;
	}

	public class CreateLegalEntityRequest
	{
		public string Email { get; set; } = null!;
		public string PhoneNumber { get; set; } = null!;
		public string CompanyName { get; set; } = null!;
		public string EIK { get; set; } = null!;
		public string RepresentativeName { get; set; } = null!;
	}
}