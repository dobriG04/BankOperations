using System.ComponentModel.DataAnnotations;

namespace BankOperations.Models
{
	public class PhysicalPerson : Client
	{
		[Required]
		[StringLength(50)]
		public string FirstName { get; set; }

		[Required]
		[StringLength(50)]
		public string LastName { get; set; }

		[Required]
		[StringLength(10, MinimumLength = 10)]
		public string EGN { get; set; }
	}
}
