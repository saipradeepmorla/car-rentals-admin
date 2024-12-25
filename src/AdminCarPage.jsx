import React, { useState, useEffect } from "react";
import { db } from "./firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

const CarForm = ({ mode, carData, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    seats: "",
    pricePerKm: "",
    description: "",
    imageFile: null,
    tariffs: {
      fullDayTariffs: {
        "12HrsRent": "",
        "24HrsRent": "",
        perKm: "",
        perExtraHour: "",
        "12HrsDriverBatta": "",
        "24HrsDriverBatta": "",
      },
      localTrips: {
        "4Hrs40Km": "",
        "8Hrs80Km": "",
        perExtraKm: "",
        perExtraHour: "",
      },
    },
  });

  useEffect(() => {
    if (mode === "edit" && carData) {
      setFormData({
        name: carData.name || "",
        seats: carData.seats || "",
        pricePerKm: carData.pricePerKm || "",
        description: carData.description || "",
        imageFile: null,
        tariffs: carData.tariffs || formData.tariffs,
      });
    } else {
      setFormData({
        name: "",
        seats: "",
        pricePerKm: "",
        description: "",
        imageFile: null,
        tariffs: {
          fullDayTariffs: {
            "12HrsRent": "",
            "24HrsRent": "",
            perKm: "",
            perExtraHour: "",
            "12HrsDriverBatta": "",
            "24HrsDriverBatta": "",
          },
          localTrips: {
            "4Hrs40Km": "",
            "8Hrs80Km": "",
            perExtraKm: "",
            perExtraHour: "",
          },
        },
      });
    }
  }, [mode, carData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleTariffChange = (e, category, key) => {
    setFormData({
      ...formData,
      tariffs: {
        ...formData.tariffs,
        [category]: {
          ...formData.tariffs[category],
          [key]: e.target.value,
        },
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 overflow-y-auto">
      <div className="min-h-screen px-4 py-6 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-lg relative">
          <div className="p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold sticky top-0 bg-white pb-4 mb-4 border-b">
              {mode === "add" ? "Add Car" : "Edit Car"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setFormData({ ...formData, imageFile: e.target.files[0] })
                  }
                  className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Car Name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full p-2 border rounded"
                  />

                  <select
                    value={formData.seats}
                    onChange={(e) =>
                      setFormData({ ...formData, seats: e.target.value })
                    }
                    className="w-full p-2 border rounded"
                  >
                    <option value="" disabled>
                      Select Seats
                    </option>
                    {[4, 7, 8, 12].map((option) => (
                      <option key={option} value={option}>
                        {option} Seats
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="Price Per Km"
                    step="0.5"
                    value={formData.pricePerKm}
                    onChange={(e) =>
                      setFormData({ ...formData, pricePerKm: e.target.value })
                    }
                    className="w-full p-2 border rounded"
                  />

                  <textarea
                    placeholder="Description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full p-2 border rounded h-24"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold mb-2">
                    Full Day Tariffs
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.keys(formData.tariffs.fullDayTariffs).map((key) => (
                      <div key={key}>
                        <label className="block text-gray-600 text-sm mb-1">
                          {key}
                        </label>
                        <input
                          type="number"
                          value={formData.tariffs.fullDayTariffs[key]}
                          onChange={(e) =>
                            handleTariffChange(e, "fullDayTariffs", key)
                          }
                          className="w-full p-2 border rounded"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-2">Local Trips</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.keys(formData.tariffs.localTrips).map((key) => (
                      <div key={key}>
                        <label className="block text-gray-600 text-sm mb-1">
                          {key}
                        </label>
                        <input
                          type="number"
                          value={formData.tariffs.localTrips[key]}
                          onChange={(e) =>
                            handleTariffChange(e, "localTrips", key)
                          }
                          className="w-full p-2 border rounded"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-white pt-4 border-t mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {mode === "add" ? "Add Car" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminCarPage = () => {
  const [cars, setCars] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState("add");
  const [selectedCar, setSelectedCar] = useState(null);

  const fetchCars = async () => {
    const querySnapshot = await getDocs(collection(db, "cars"));
    const carsData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setCars(carsData);
  };

  const handleAddOrEditCar = async (data) => {
    try {
      if (mode === "add") {
        if (data.imageFile) {
          const reader = new FileReader();
          reader.onload = async () => {
            const base64Image = reader.result;
            await addDoc(collection(db, "cars"), {
              name: data.name,
              seats: parseInt(data.seats),
              pricePerKm: parseFloat(data.pricePerKm),
              description: data.description,
              image: base64Image,
              tariffs: data.tariffs,
            });
            fetchCars();
          };
          reader.readAsDataURL(data.imageFile);
        } else {
          console.error("Image file is required for adding a car.");
        }
      } else if (mode === "edit" && selectedCar) {
        const carRef = doc(db, "cars", selectedCar.id);
        const updatedData = {
          name: data.name,
          seats: parseInt(data.seats),
          pricePerKm: parseFloat(data.pricePerKm),
          description: data.description,
          tariffs: data.tariffs,
        };

        if (data.imageFile) {
          const reader = new FileReader();
          reader.onload = async () => {
            updatedData.image = reader.result;
            await updateDoc(carRef, updatedData);
            fetchCars();
          };
          reader.readAsDataURL(data.imageFile);
        } else {
          await updateDoc(carRef, updatedData);
          fetchCars();
        }
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving car:", error);
    }
  };

  const handleDeleteCar = async (id) => {
    try {
      await deleteDoc(doc(db, "cars", id));
      fetchCars();
    } catch (error) {
      console.error("Error deleting car:", error);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  return (
    <div className="p-6 bg-gray-50">
      <h2 className="text-3xl font-bold mb-4 text-center">
        Admin - Manage Cars
      </h2>
      <button
        onClick={() => {
          setMode("add");
          setSelectedCar(null);
          setIsModalOpen(true);
        }}
        className="mb-6 bg-green-600 text-white px-6 py-3 rounded-full hover:bg-green-700 transition"
      >
        Add Car
      </button>

      {cars.length === 0 ? (
        <p className="text-center text-gray-500">
          No cars available. Add a car to get started.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {cars.map((car) => (
            <div
              key={car.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform transform hover:scale-105 hover:shadow-2xl"
            >
              {car.image && (
                <div className="relative w-full h-48">
                  <img
                    src={car.image}
                    alt={car.name || "Car Image"}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-2">
                  {car.name || "No Name"}
                </h4>
                <p className="text-gray-600 mb-2">Seats: {car.seats}</p>
                <p className="text-gray-600 mb-2">
                  Price per Km: ₹{car.pricePerKm?.toFixed(2)}
                </p>
                <p className="text-gray-600 mb-4">
                  {car.description || "No Description"}
                </p>

                <h5 className="text-sm font-bold">Full Day Tariffs:</h5>
                <ul className="text-sm text-gray-500">
                  {Object.entries(car.tariffs.fullDayTariffs).map(
                    ([key, value]) => (
                      <li key={key}>
                        {key}: ₹{value}
                      </li>
                    )
                  )}
                </ul>

                <h5 className="text-sm font-bold mt-2">Local Trips:</h5>
                <ul className="text-sm text-gray-500">
                  {Object.entries(car.tariffs.localTrips).map(
                    ([key, value]) => (
                      <li key={key}>
                        {key}: ₹{value}
                      </li>
                    )
                  )}
                </ul>

                <div className="flex justify-between mt-4">
                  <button
                    onClick={() => {
                      setMode("edit");
                      setSelectedCar(car);
                      setIsModalOpen(true);
                    }}
                    className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCar(car.id)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <CarForm
          mode={mode}
          carData={selectedCar}
          onSubmit={handleAddOrEditCar}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminCarPage;
