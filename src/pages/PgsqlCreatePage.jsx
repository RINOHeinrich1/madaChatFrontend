import React, { useState } from "react";
import { Database, PlugZap, CheckCircle, AlertCircle, X } from "lucide-react";
import axios from "axios";
import FormInput from "../ui/FormInput";
import FormSelect from "../ui/FormSelect";
import { supabase } from "../lib/supabaseClient";
import PgsqlVectorizerModal from "../components/pgsqlVectorizerModal";

export default function PgsqlCreatePage() {
  const [serviceUrl, setServiceUrl] = useState("https://postgresvectorizer.onirtech.com");
  const [connParams, setConnParams] = useState({
    host: "localhost",
    port: 5432,
    user: "testuser",
    password: "testpass",
    dbname: "testdb",
    sslmode: "disable",
  });
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState("");

  // Modale
  const [modalOpen, setModalOpen] = useState(false);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [template, setTemplate] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConnParams((prev) => ({
      ...prev,
      [name]: name === "port" ? parseInt(value) || 0 : value,
    }));
    if (message.text) setMessage({ text: "", type: "" });
  };

  const testConnection = async () => {
    if (!serviceUrl) {
      setMessage({ text: "Veuillez saisir l'URL du service.", type: "error" });
      return;
    }
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await axios.post(`${serviceUrl}/connect`, connParams, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage({
        text: `Connexion réussie : ${response.data.message || "OK"}`,
        type: "success",
      });
    } catch (err) {
      setMessage({
        text: `Erreur connexion : ${
          err.response?.data?.message || err.message
        }`,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const openTableModal = async () => {
    if (!serviceUrl) {
      setMessage({ text: "Veuillez saisir l'URL du service.", type: "error" });
      return;
    }
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      const params = new URLSearchParams({
        host: connParams.host,
        port: connParams.port,
        user: connParams.user,
        password: connParams.password,
        dbname: connParams.dbname,
        sslmode: connParams.sslmode,
      });
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await axios.get(
        `${serviceUrl}/tables?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTables(response.data);
      setModalOpen(true);
      // NE PAS afficher de message ici
      setSelectedTable("");
      setTemplate("");
    } catch (err) {
      setMessage({
        text: `Erreur récupération tables: ${
          err.response?.data?.message || err.message
        }`,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };


const sendToStaticVectorizer = async () => {
  if (!selectedTable) {
    setMessage({ text: "Veuillez sélectionner une table.", type: "error" });
    return;
  }

  setLoading(true);
  setMessage({ text: "", type: "" });

  try {
    // 1. Récupérer l'utilisateur connecté
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      throw new Error("Utilisateur non connecté.");
    }

    const user = session.user;

    // 2. Construire le payload
    const payload = {
      host: connParams.host,
      port: connParams.port,
      user: connParams.user,
      password: connParams.password,
      dbname: connParams.dbname,
      table_name: selectedTable,
      template: template,
      page_size: 50,
    };
    console.log("Payload:", payload);

    // 3. Envoyer la requête au microservice vectorizer
    const token = session.access_token;

    const response = await axios.post(
      `${serviceUrl}/staticvectorizer`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // 4. Enregistrer dans Supabase
    const { error: insertError } = await supabase.from("postgresql_connexions").insert([
      {
        host_name: connParams.host,
        port: connParams.port,
        database: connParams.dbname,
        table_name: selectedTable,
        owner_id: user.id,
      },
    ]);

    if (insertError) {
      console.error("Erreur insertion Supabase:", insertError);
      throw new Error("Enregistrement Supabase échoué.");
    }

    setMessage({
      text: `Vectorizer : ${response.data.message || "Succès"}`,
      type: "success",
    });
    setModalOpen(false);
  } catch (err) {
    setMessage({
      text: `Erreur vectorizer : ${err.message}`,
      type: "error",
    });
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 text-gray-800 dark:text-gray-100 flex items-center justify-center font-inter transition-all duration-500 px-4 py-8">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Database className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Connexion PostgreSQL
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            Testez la connexion à votre base PostgreSQL, puis sélectionnez une
            table à vectoriser.
          </p>
        </div>

        {/* Formulaire */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-8 lg:p-12 animate-slide-up space-y-6">
          <FormInput
            label="URL du service"
            name="serviceUrl"
            value={serviceUrl}
            onChange={(e) => setServiceUrl(e.target.value)}
            focused={focusedField === "serviceUrl"}
            onFocus={() => setFocusedField("serviceUrl")}
            onBlur={() => setFocusedField("")}
            placeholder="http://localhost:7777"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {["host", "port", "user", "password", "dbname"].map((field, i) => (
              <FormInput
                key={field}
                label={field.charAt(0).toUpperCase() + field.slice(1)}
                name={field}
                type={
                  field === "password"
                    ? "password"
                    : field === "port"
                    ? "number"
                    : "text"
                }
                value={connParams[field]}
                onChange={handleChange}
                focused={focusedField === field}
                onFocus={() => setFocusedField(field)}
                onBlur={() => setFocusedField("")}
                animationDelay={`${0.2 + i * 0.1}s`}
              />
            ))}

            <FormSelect
              label="SSL Mode"
              name="sslmode"
              value={connParams.sslmode}
              onChange={handleChange}
              focused={focusedField === "sslmode"}
              onFocus={() => setFocusedField("sslmode")}
              onBlur={() => setFocusedField("")}
              options={[
                "disable",
                "allow",
                "prefer",
                "require",
                "verify-ca",
                "verify-full",
              ]}
              animationDelay="0.7s"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              disabled={loading}
              onClick={testConnection}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-4 rounded-xl flex justify-center items-center gap-3 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PlugZap className="w-5 h-5" />
              Tester la connexion
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={openTableModal}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-xl flex justify-center items-center gap-3 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Database className="w-5 h-5" />
              Sélectionner une table
            </button>
          </div>

          {message.text && (
            <div
              className={`flex items-start gap-3 p-4 rounded-xl border animate-fade-in mt-4 ${
                message.type === "success"
                  ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700"
                  : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              )}
              <p className="text-sm whitespace-pre-wrap text-gray-800 dark:text-gray-100">
                {message.text}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modale */}
      {modalOpen && (
        <PgsqlVectorizerModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          tables={tables}
          selectedTable={selectedTable}
          setSelectedTable={setSelectedTable}
          template={template}
          setTemplate={setTemplate}
          onSend={sendToStaticVectorizer}
          loading={loading}
        />
      )}
    </div>
  );
}
