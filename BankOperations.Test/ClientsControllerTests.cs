using BankOperations.Controllers;
using BankOperations.Data;
using BankOperations.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace BankOperations.Tests
{
	public class ClientsControllerTests
	{
		private ApplicationDbContext GetInMemoryDbContext()
		{
			var options = new DbContextOptionsBuilder<ApplicationDbContext>()
				.UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
				.Options;
			return new ApplicationDbContext(options);
		}

		[Fact]
		public void CreatePhysicalPerson_ShouldSaveToDatabase_AndReturnOk()
		{
			// Arrange
			var context = GetInMemoryDbContext();
			var controller = new ClientsController(context);
			var request = new CreatePhysicalPersonRequest
			{
				Email = "ivan@test.bg",
				PhoneNumber = "0888111222",
				FirstName = "Ivan",
				LastName = "Ivanov",
				EGN = "1234567890"
			};

			// Act
			var result = controller.CreatePhysicalPerson(request);

			// Assert
			Assert.IsType<OkObjectResult>(result); 

			var savedPerson = context.PhysicalPersons.FirstOrDefault();
			Assert.NotNull(savedPerson);
			Assert.Equal("Ivan", savedPerson.FirstName);
			Assert.Equal("1234567890", savedPerson.EGN);
		}

		[Fact]
		public void CreateLegalEntity_ShouldSaveToDatabase_AndReturnOk()
		{
			// Arrange
			var context = GetInMemoryDbContext();
			var controller = new ClientsController(context);
			var request = new CreateLegalEntityRequest
			{
				Email = "office@firma.bg",
				PhoneNumber = "0899123123",
				CompanyName = "Super Firma OOD",
				EIK = "123456789",
				RepresentativeName = "Georgi Georgiev"
			};

			// Act
			var result = controller.CreateLegalEntity(request);

			// Assert
			Assert.IsType<OkObjectResult>(result);

			var savedEntity = context.LegalEntities.FirstOrDefault();
			Assert.NotNull(savedEntity);
			Assert.Equal("Super Firma OOD", savedEntity.CompanyName);
			Assert.Equal("123456789", savedEntity.EIK);
		}

		[Fact]
		public void GetAllClients_ShouldReturnAllClientTypes()
		{
			// Arrange
			var context = GetInMemoryDbContext();
			context.PhysicalPersons.Add(new PhysicalPerson { FirstName = "Ivan", LastName = "Ivanov", EGN = "111", Email = "a@a.bg", PhoneNumber = "1" });
			context.LegalEntities.Add(new LegalEntity { CompanyName = "Firma", EIK = "222", RepresentativeName = "Petar", Email = "b@b.bg", PhoneNumber = "2" });
			context.SaveChanges();

			var controller = new ClientsController(context);

			// Act
			var result = controller.GetAllClients();

			// Assert
			var okResult = Assert.IsType<OkObjectResult>(result);
			var clientsList = Assert.IsAssignableFrom<IEnumerable<Client>>(okResult.Value);
			Assert.Equal(2, clientsList.Count()); 
		}
	}
}