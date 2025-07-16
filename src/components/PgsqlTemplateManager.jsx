import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { ArrowLeft, Trash2, Edit } from "lucide-react";

export default function PgsqlTemplateManager() {
  const navigate = useNavigate();
  const location = useLocation();
  const connexion = location.state?.connexion;

  const [templates, setTemplates] = useState([]);
  const [template, setTemplate] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [serviceUrl, setServiceUrl] = useState("");
  const [variables, setVariables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ownerId, setOwnerId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [contextual, setContextual] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !connexion) return;

      const connexionName = `${connexion.database}/${connexion.table_name}`;
      setOwnerId(user.id);

      const { data: tplData, error: tplError } = await supabase
        .from("postgresql_templates")
        .select("*")
        .eq("owner_id", user.id)
        .eq("connexion_name", connexionName);
      if (!tplError) setTemplates(tplData);

      const { data: connData } = await supabase
        .from("postgresql_connexions")
        .select("postgres_service_url")
        .eq("owner_id", user.id)
        .eq("connexion_name", connexionName);
      if (connData?.length) setServiceUrl(connData[0].postgres_service_url);

      const { data: varData } = await supabase
        .from("variables")
        .select("*")
        .eq("owner_id", user.id)
        .eq("connexion_name", connexionName);
      if (varData) setVariables(varData);
    };

    fetchData();
  }, [connexion]);

  const resetForm = () => {
    setTemplate("");
    setDescription("");
    setEditingId(null);
    setContextual(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const connexionName = `${connexion.database}/${connexion.table_name}`;
    const dataId = editingId || Date.now().toString();

    try {
      const session = await supabase.auth.getSession();
      const accessToken = session.data.session?.access_token;

      const endpoint = "/upsert-single";
      const res = await fetch(`${serviceUrl}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          text: template,
          source: connexionName,
          data_id: dataId,
          contextual:String(contextual),
        }),
      });

      if (!res.ok) throw new Error(`Erreur appel Qdrant (${endpoint})`);

      const payload = {
        owner_id: ownerId,
        connexion_name: connexionName,
        template,
        description,
        data_id: dataId,
        contextual,
      };

      const { error } = editingId
        ? await supabase
            .from("postgresql_templates")
            .update(payload)
            .eq("data_id", editingId)
        : await supabase.from("postgresql_templates").insert(payload);

      if (error) throw new Error("Erreur Supabase : " + error.message);

      alert(`Template ${editingId ? "modifié" : "créé"} avec succès.`);
      window.location.reload();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
      resetForm();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce template ?")) return;

    const connexionName = `${connexion.database}/${connexion.table_name}`;
    const session = await supabase.auth.getSession();
    const accessToken = session.data.session?.access_token;

    await fetch(`${serviceUrl}/delete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ source: connexionName, data_id: id }),
    });

    await supabase.from("postgresql_templates").delete().eq("data_id", id);
    setTemplates((prev) => prev.filter((t) => t.data_id !== id));
  };

  const handleEdit = (tpl) => {
    setTemplate(tpl.template);
    setContextual(tpl.contextual || false);
    setDescription(tpl.description);
    setEditingId(tpl.data_id);
  };

  const insertVariable = (name) => {
    setTemplate((prev) => `${prev} {{.${name}}}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white px-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg w-full max-w-3xl">
        <button
          onClick={() => navigate(-1)}
          className="text-sm mb-4 text-indigo-500 hover:underline flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>

        <h1 className="text-2xl font-bold mb-4">
          Gérer les templates PostgreSQL
        </h1>

        <div className="mb-6 border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
          <p className="font-semibold mb-2 text-gray-700 dark:text-gray-300">
            Variables disponibles :
          </p>
          <ul className="list-disc pl-5 text-sm text-gray-700 dark:text-gray-300">
            {variables.map((v) => (
              <li
                key={v.id}
                className="cursor-pointer hover:underline"
                onClick={() => insertVariable(v.variable_name)}
              >
                <span className="font-mono text-indigo-600 dark:text-indigo-400">
                  {`{{.${v.variable_name}}}`}
                </span>
                <span className="text-gray-500 text-xs ml-2">
                  depuis requête : {v.request.slice(0, 60)}...
                </span>
              </li>
            ))}
            {variables.length === 0 && <li>Aucune variable disponible.</li>}
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          <div>
            <label className="block text-sm font-medium mb-1">Template</label>
            <textarea
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border"
              rows={4}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="contextual"
              type="checkbox"
              checked={contextual}
              onChange={() => setContextual(!contextual)}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label htmlFor="contextual" className="text-sm">
              Contextuel
            </label>
          </div>

          {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl shadow-md w-full"
          >
            {loading
              ? "Enregistrement..."
              : editingId
              ? "Mettre à jour"
              : "Créer"}
          </button>
        </form>

        <h2 className="text-xl font-semibold mb-3">Templates existants</h2>
        <div className="space-y-2">
          {templates.length === 0 && (
            <p className="text-gray-400">Aucun template trouvé.</p>
          )}
          {templates.map((tpl) => (
            <div
              key={tpl.data_id}
              className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg flex justify-between items-center"
            >
              <div>
                <p className="font-medium text-sm">
                  {tpl.description || "(Sans description)"}
                </p>
                <pre className="text-xs text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                  {tpl.template}
                </pre>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(tpl)} title="Modifier">
                  <Edit className="w-5 h-5 text-yellow-500" />
                </button>
                <button
                  onClick={() => handleDelete(tpl.data_id)}
                  title="Supprimer"
                >
                  <Trash2 className="w-5 h-5 text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
