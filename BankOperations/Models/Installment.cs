using System.ComponentModel.DataAnnotations.Schema;

namespace BankOperations.Models
{
	public class Installment
	{
		public int Id { get; set; }

		public int MonthNumber { get; set; }

		[Column(TypeName = "decimal(18,2)")]
		public decimal TotalAmount { get; set; }

		[Column(TypeName = "decimal(18,2)")]
		public decimal PrincipalPart { get; set; }

		[Column(TypeName = "decimal(18,2)")]
		public decimal InterestPart { get; set; }

		[Column(TypeName = "decimal(18,2)")]
		public decimal RemainingBalance { get; set; }

		public bool isPaid { get; set; } = false;

		public int CreditId { get; set; }
		public Credit Credit { get; set; }
	}
}
