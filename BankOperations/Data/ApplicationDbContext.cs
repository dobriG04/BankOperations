using BankOperations.Models;
using Microsoft.EntityFrameworkCore;

namespace BankOperations.Data
{
	public class ApplicationDbContext : DbContext
	{
		public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
			: base(options)
		{
		}

		public DbSet<Client> Clients { get; set; }
		public DbSet<PhysicalPerson> PhysicalPersons { get; set; }
		public DbSet<LegalEntity> LegalEntities { get; set; }
		public DbSet<BankAccount> BankAccounts { get; set; }
		public DbSet<Credit> Credits { get; set; }
		public DbSet<Installment> Installments { get; set; }

		protected override void OnModelCreating(ModelBuilder modelbuilder)
		{
			base.OnModelCreating(modelbuilder);

			modelbuilder.Entity<BankAccount>()
				.Property(b => b.Balance)
				.HasPrecision(18, 2);

			modelbuilder.Entity<Credit>()
				.Property(c => c.Amount)
				.HasPrecision(18, 2);

			modelbuilder.Entity<Installment>()
				.Property(i => i.TotalAmount).HasPrecision(18, 2);
			modelbuilder.Entity<Installment>()
				.Property(i => i.PrincipalPart).HasPrecision(18, 2);
			modelbuilder.Entity<Installment>()
				.Property(i => i.InterestPart).HasPrecision(18, 2);
			modelbuilder.Entity<Installment>()
				.Property(i => i.RemainingBalance).HasPrecision(18, 2);
		}
	}
}
