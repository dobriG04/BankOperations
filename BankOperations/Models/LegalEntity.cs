using System.ComponentModel.DataAnnotations;

namespace BankOperations.Models
{
	public class LegalEntity : Client
	{
		[Required]
		[StringLength(100)]
		public string CompanyName { get; set; }

		[Required]
		[StringLength(9, MinimumLength = 9)]
		public string EIK { get; set; }

		[Required]
		[StringLength(100)]
		public string RepresentativeName { get; set; }
	}
}
