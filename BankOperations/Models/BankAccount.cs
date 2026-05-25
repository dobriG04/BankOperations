using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using BankOperations.Models.Enums;

namespace BankOperations.Models
{
	public class BankAccount
	{
		public int Id { get; set; }

		[Required]
		[StringLength(22, MinimumLength = 22)]
		public string IBAN { get; set; }

		[Column(TypeName = "decimal(18,2)")]
		public decimal Balance { get; set; }

		public AccountStatus Status { get; set; } = AccountStatus.Active;

		public int ClientId { get; set; }
		public Client Client { get; set; }
	}
}
