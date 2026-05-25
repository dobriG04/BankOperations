using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using BankOperations.Models.Enums;

namespace BankOperations.Models
{
	public class Credit
	{
		public int Id { get; set; }

		public CreditType Type { get; set; }

		[Range(0, double.MaxValue, ErrorMessage = "The amount cannot be negative.")]
		[Column(TypeName = "decimal(18,2)")]
		public decimal Amount { get; set; }

		[Range(1, 360, ErrorMessage = "The duration must be between 1 and 360 months.")]
		public int DurationInMonths { get; set; }

		public int ClientId { get; set; }
		public Client Client { get; set; }

		public ICollection<Installment> Installments { get; set; } = new List<Installment>();
	}
}
