using System.ComponentModel.DataAnnotations;

namespace BankOperations.Models
{
	public class Client
	{
		public int Id { get; set; }

		[Required]
		[EmailAddress]
		public string Email { get; set; }

		[Required]
		[Phone]
		public string PhoneNumber { get; set; }

		public ICollection<BankAccount> BankAccounts { get; set; } = new List<BankAccount>();
		public ICollection<Credit> Credits { get; set; } = new List<Credit>();
	}
}
