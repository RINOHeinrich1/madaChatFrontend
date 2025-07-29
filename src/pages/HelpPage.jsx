import { useState } from "react";
import {
  HelpCircle,
  FileText,
  List,
  Upload,
  Search,
  Shield,
  Users,
  Mail,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Lightbulb,
  AlertCircle,
  CheckCircle,
  Info,
  ExternalLink,
  Database,
  Layers,
  MessageSquare,
  RefreshCw,
} from "lucide-react";

function Help() {
  const [activeTab, setActiveTab] = useState("guide");
  const [openFaqItems, setOpenFaqItems] = useState(new Set());

  const toggleFaqItem = (index) => {
    const newOpenItems = new Set(openFaqItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenFaqItems(newOpenItems);
  };

  const TabButton = ({ id, icon: Icon, label, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-6 py-4 rounded-xl font-medium transition-all duration-200 ${
        isActive
          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
          : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
      }`}
    >
      <Icon className="w-5 h-5" />
      {label}
    </button>
  );

  const faqData = [
    {
      question: "Comment créer un chatbot avec Madachat ?",
      answer:
        "Rendez-vous dans l'onglet 'Chatbots', cliquez sur 'Ajouter un chatbot', puis renseignez les paramètres souhaités : nom, description, mémoire contextuelle, sources autorisées, etc. Une fois créé, vous pourrez l’associer à vos sources de données.",
      icon: MessageSquare,
    },
    {
      question: "Quels types de sources peut-on utiliser avec Madachat ?",
      answer:
        "Madachat supporte plusieurs types de sources : documents PDF, Word (.docx, .odt), et également les bases de données PostgreSQL. Cela vous permet de créer un chatbot capable de répondre à partir de fichiers ou de données structurées.",
      icon: FileText,
    },
    {
      question: "Comment connecter une base PostgreSQL à mon chatbot ?",
      answer:
        "Allez dans l’onglet 'Sources', sélectionnez 'Base de données PostgreSQL', puis ajoutez vos identifiants de connexion PostgreSQL (hôte, base, utilisateur, mot de passe, tables à indexer). Une fois validée, la source sera indexée et disponible pour vos chatbots.",
      icon: Database,
    },
    {
      question: "Comment fonctionne la recherche avec Madachat ?",
      answer:
        "Madachat utilise la technique RAG (Retrieval-Augmented Generation) : lors d’une question, les documents ou données les plus pertinents sont d'abord récupérés, puis une réponse est générée en s’appuyant sur ces sources.D'un autre côté madaChat utilise aussi la puissance des LLM pour effectuer du text2SQL pour les bases PostgreSQL. Cela garantit des réponses précises et contextualisées.",
      icon: Search,
    },
    {
      question: "Est-ce que mes données sont sécurisées ?",
      answer:
        "Oui. Toutes les données (documents et bases) sont stockées de manière sécurisée avec un chiffrement de bout en bout. L’accès est limité à votre compte authentifié, et aucune donnée n’est partagée sans votre consentement.",
      icon: Shield,
    },
    {
      question: "Puis-je utiliser plusieurs sources pour un seul chatbot ?",
      answer:
        "Absolument. Un chatbot peut être alimenté par plusieurs documents et bases PostgreSQL. Vous pouvez associer ou désassocier des sources à tout moment depuis l’interface 'Chatbots'.",
      icon: Layers,
    },
    {
      question: "Comment mettre à jour une source connectée ?",
      answer:
        "Pour les documents, il suffit de supprimer l’ancien fichier et d’en ajouter un nouveau. Pour une base PostgreSQL, vous pouvez modifiez la connexion directement via le bouton d'edit ou le supprimer",
      icon: RefreshCw,
    },
    {
      question: "Pourquoi le chatbot ne trouve-t-il pas certaines réponses ?",
      answer:
        "Assurez-vous que la source associée contient bien les informations recherchées. Essayez de reformuler votre question, ou vérifiez que la source a bien été indexée. Le système fonctionne mieux avec un contenu clair et structuré.",
      icon: AlertCircle,
    },
  ];

  const guideSteps = [
    {
      title: "Importation de documents",
      description:
        "Madachat permet de créer des chatbots à partir de plusieurs sources. La plus simple, ce sont les documents.",
      icon: Upload,
      steps: [
        "Cliquez sur l'option 'Sources' de la barre latérale (SideBar)",
        "Choisissez 'Documents'",
        "Cliquez sur l'onglet 'Mes Documents'",
        "Appuyez sur le bouton 'Ajouter un document'",
        "Sélectionnez votre fichier (PDF, DOCX, ODT)",
        "Attendez que l'indexation se termine",
        "Votre document apparaîtra dans la liste",
      ],
    },
    {
      title: "Création de Chatbot",
      description:
        "Une fois une source créée, vous pouvez l'attacher à un chatbot pour l'alimenter avec vos informations.",
      icon: MessageSquare,
      steps: [
        "Allez dans l'option 'Chatbots' de la barre latérale",
        "Cliquez sur le bouton 'Ajouter un chatbot'",
        "Paramétrez le nom du chatbot, sa description, la mémoire contextuelle si nécessaire, les URL autorisées si nécessaire",
        'Cliquez sur "Créer le chatbot"',
      ],
    },
    {
      title: "Associer des sources à votre chatbot",
      description:
        "Une fois les chatbots et les sources créés, vous pouvez les associer ensemble.",
      icon: FileText,
      steps: [
        'Dans l\'interface "Chatbots", cliquez sur l\'icône "document" du chatbot que vous voulez alimenter',
        "Tapez le nom du document dans le modal qui apparaît",
        "Décrivez bien le rôle du document",
        "Cliquez sur le bouton 'Associer'",
        "Une fois associé, le chatbot pourra se servir du document",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-800 dark:text-gray-100 transition-colors duration-300 font-inter p-6">
      <div className="max-w-6xl mx-auto">
        {/* En-tête principal */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-3">
            <HelpCircle className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
            Centre d'aide
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Trouvez rapidement les réponses à vos questions
          </p>
        </div>

        {/* Système d'onglets */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center">
          <TabButton
            id="guide"
            icon={BookOpen}
            label="Guide de démarrage"
            isActive={activeTab === "guide"}
            onClick={() => setActiveTab("guide")}
          />
          <TabButton
            id="faq"
            icon={MessageCircle}
            label="FAQ"
            isActive={activeTab === "faq"}
            onClick={() => setActiveTab("faq")}
          />
          <TabButton
            id="contact"
            icon={Mail}
            label="Support"
            isActive={activeTab === "contact"}
            onClick={() => setActiveTab("contact")}
          />
        </div>

        {/* Contenu des onglets */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {activeTab === "guide" && (
            <div className="p-8 space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
                  Guide de démarrage
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Apprenez à créer votre premier Chatbot
                </p>
              </div>

              {/* Conseil rapide */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800">
                <div className="flex items-start gap-4">
                  <Lightbulb className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                      Guides de démarrages
                    </h3>
                    <p className="text-blue-700 dark:text-blue-400 text-sm">
                      Les étapes suivantes vous permettraient de créer un
                      chatbot avec Madachat
                    </p>
                  </div>
                </div>
              </div>

              {/* Étapes du guide */}
              <div className="space-y-8">
                {guideSteps.map((step, index) => (
                  <div key={index} className="relative">
                    <div className="flex items-start gap-6">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                          <step.icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                          {step.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          {step.description}
                        </p>
                        <div className="space-y-3">
                          {step.steps.map((stepText, stepIndex) => (
                            <div
                              key={stepIndex}
                              className="flex items-start gap-3"
                            >
                              <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-green-600 dark:text-green-400 text-xs font-bold">
                                  {stepIndex + 1}
                                </span>
                              </div>
                              <p className="text-gray-700 dark:text-gray-300 text-sm">
                                {stepText}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    {index < guideSteps.length - 1 && (
                      <div className="absolute left-6 top-16 w-0.5 h-8 bg-gray-200 dark:bg-gray-600"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "faq" && (
            <div className="p-8 space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
                  Questions fréquentes
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Les réponses aux questions les plus courantes
                </p>
              </div>

              <div className="space-y-4">
                {faqData.map((item, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden"
                  >
                    <button
                      onClick={() => toggleFaqItem(index)}
                      className="w-full p-6 text-left bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <item.icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {item.question}
                        </span>
                      </div>
                      {openFaqItems.has(index) ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                    {openFaqItems.has(index) && (
                      <div className="p-6 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-600">
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {item.answer}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Section conseils supplémentaires */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-xl border border-green-100 dark:border-green-800">
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2">
                      Conseils pour une recherche optimale
                    </h3>
                    <ul className="text-green-700 dark:text-green-400 text-sm space-y-1">
                      <li>• Utilisez des mots-clés spécifiques et précis</li>
                      <li>
                        • Essayez différentes formulations de votre question
                      </li>
                      <li>
                        • Privilégiez les termes présents dans vos documents
                      </li>
                      <li>
                        • Combinez plusieurs mots-clés pour affiner vos
                        résultats
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "contact" && (
            <div className="p-8 space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
                  Support et contact
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Besoin d'aide supplémentaire ? Contactez notre équipe
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Support par email */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                      <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-800 dark:text-blue-300">
                        Support par email
                      </h3>
                      <p className="text-blue-600 dark:text-blue-400 text-sm">
                        Réponse sous 24h
                      </p>
                    </div>
                  </div>
                  <p className="text-blue-700 dark:text-blue-400 text-sm mb-4">
                    Pour toute question technique ou problème d'utilisation
                  </p>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    contact@onirtech.com
                  </button>
                </div>

                {/* Documentation */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-xl border border-purple-100 dark:border-purple-800">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-purple-800 dark:text-purple-300">
                        Documentation
                      </h3>
                      <p className="text-purple-600 dark:text-purple-400 text-sm">
                        Guides détaillés
                      </p>
                    </div>
                  </div>
                  <p className="text-purple-700 dark:text-purple-400 text-sm mb-4">
                    Consultez notre documentation complète en ligne
                  </p>
                  <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Voir la documentation
                  </button>
                </div>
              </div>

              {/* Informations système */}
              <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                  <Info className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Informations système
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Version :
                    </span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      0.1.1
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Sources supportés :
                    </span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      PDF, DOCX, ODT,PostgreSQL
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Statut :
                    </span>
                    <span className="ml-2 inline-flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="font-medium text-green-600 dark:text-green-400">
                        Opérationnel
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Note de sécurité */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-6 rounded-xl border border-amber-100 dark:border-amber-800">
                <div className="flex items-start gap-4">
                  <Shield className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">
                      Sécurité et confidentialité
                    </h3>
                    <p className="text-amber-700 dark:text-amber-400 text-sm">
                      Vos documents sont stockés de manière sécurisée et ne sont
                      accessibles qu'à vous. Nous utilisons un chiffrement de
                      bout en bout et ne partageons jamais vos données avec des
                      tiers.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Help;
