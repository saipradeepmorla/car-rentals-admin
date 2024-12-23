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
  });

  useEffect(() => {
    if (mode === "edit" && carData) {
      setFormData({
        name: carData.name || "",
        seats: carData.seats || "",
        pricePerKm: carData.pricePerKm || "",
        description: carData.description || "",
        imageFile: null,
      });
    } else {
      setFormData({
        name: "",
        seats: "",
        pricePerKm: "",
        description: "",
        imageFile: null,
      });
    }
  }, [mode, carData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">
          {mode === "add" ? "Add Car" : "Edit Car"}
        </h2>
        <form onSubmit={handleSubmit}>
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setFormData({ ...formData, imageFile: e.target.files[0] })
            }
            className="block w-full mb-4 p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Car Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="block w-full mb-4 p-2 border rounded"
          />
          <select
            value={formData.seats}
            onChange={(e) =>
              setFormData({ ...formData, seats: e.target.value })
            }
            className="block w-full mb-4 p-2 border rounded"
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
          <input
            type="number"
            placeholder="Price Per Km"
            step="0.5"
            value={formData.pricePerKm}
            onChange={(e) =>
              setFormData({ ...formData, pricePerKm: e.target.value })
            }
            className="block w-full mb-4 p-2 border rounded"
          />
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="block w-full mb-4 p-2 border rounded"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition"
          >
            {mode === "add" ? "Add Car" : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="ml-4 text-gray-500 underline"
          >
            Cancel
          </button>
        </form>
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
        // Adding a new car
        if (data.imageFile) {
          const reader = new FileReader();
          reader.onload = async () => {
            const base64Image = reader.result;
            await addDoc(collection(db, "cars"), {
              name: data.name,
              seats: parseInt(data.seats),
              pricePerKm: parseFloat(data.pricePerKm),
              description: data.description,
              image: base64Image, // Store as base64 string
            });
            fetchCars();
          };
          reader.readAsDataURL(data.imageFile);
        } else {
          console.error("Image file is required for adding a car.");
        }
      } else if (mode === "edit" && selectedCar) {
        // Editing an existing car
        const carRef = doc(db, "cars", selectedCar.id);
        const updatedData = {
          name: data.name,
          seats: parseInt(data.seats),
          pricePerKm: parseFloat(data.pricePerKm),
          description: data.description,
        };
  
        if (data.imageFile) {
          // Process new image file
          const reader = new FileReader();
          reader.onload = async () => {
            updatedData.image = reader.result; // Convert file to base64
            await updateDoc(carRef, updatedData);
            fetchCars();
          };
          reader.readAsDataURL(data.imageFile);
        } else {
          // No new image, update other fields only
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

              <div className="flex justify-between">
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
