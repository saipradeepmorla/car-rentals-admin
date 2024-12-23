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

const Adds = () => {
  const [adds, setAdds] = useState([]);
  const [mode, setMode] = useState("add");
  const [selectedCar, setSelectedCar] = useState(null);
  const [formData, setFormData] = useState({
    imageFile: null,
  });

  const fetchCars = async () => {
    const querySnapshot = await getDocs(collection(db, "adds"));
    const carsData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setAdds(carsData);
  };

  const handleAddOrEditCar = async (data) => {
    try {
      if (mode === "add") {
        // Adding a new car with only an image
        if (data.imageFile) {
          const reader = new FileReader();
          reader.onload = async () => {
            const base64Image = reader.result;
            await addDoc(collection(db, "adds"), {
              image: base64Image, // Store only the image as base64
            });
            fetchCars();
          };
          reader.readAsDataURL(data.imageFile);
        } else {
          console.error("Image file is required for adding a car.");
        }
      } else if (mode === "edit" && selectedCar) {
        // Editing an existing car image only
        const carRef = doc(db, "adds", selectedCar.id);
        const updatedData = {};

        if (data.imageFile) {
          // Process new image file
          const reader = new FileReader();
          reader.onload = async () => {
            updatedData.image = reader.result; // Convert file to base64
            await updateDoc(carRef, updatedData);
            fetchCars();
          };
          reader.readAsDataURL(data.imageFile);
        }
      }
    } catch (error) {
      console.error("Error saving car:", error);
    }
  };

  const handleDeleteCar = async (id) => {
    try {
      await deleteDoc(doc(db, "adds", id));
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
        Admin Special Add's
      </h2>

      {/* Add or Edit Car Form */}
      <div className="mb-6">
        <h3 className="text-2xl font-bold mb-4 text-center">
          {mode === "add" ? "Add Car" : "Edit Car"}
        </h3>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddOrEditCar(formData);
          }}
          className="bg-white p-6 rounded-lg shadow-lg"
        >
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setFormData({ ...formData, imageFile: e.target.files[0] })
            }
            className="block w-full mb-4 p-2 border rounded"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition"
          >
            {mode === "add" ? "Add Car" : "Save Changes"}
          </button>
        </form>
      </div>

      {/* Displaying Car List */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {adds.map((add) => (
          <div
            key={add.id}
            className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform transform hover:scale-105 hover:shadow-2xl"
          >
            {add.image && (
              <div className="relative w-full h-48">
                <img
                  src={add.image}
                  alt={add.name || "Car Image"}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-4">
              <div className="flex justify-between">
                <button
                  onClick={() => {
                    setMode("edit");
                    setSelectedCar(add);
                    setFormData({
                      imageFile: null, // Reset the image field
                    });
                  }}
                  className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
                >
                  Edit Image
                </button>
                <button
                  onClick={() => handleDeleteCar(add.id)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Adds;
