"use client";

import * as React from "react";
import {
  BookOpen,
  Check,
  ChevronRight,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Pencil,
  Plus,
  Settings,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  supabase,
  STORAGE_BUCKET,
  MODEL_DISPLAY_NAMES,
  getExpectedFilename,
} from "@/lib/supabase";
import { SUPABASE_URL } from "@/lib/ai-models";

// ─── Types ──────────────────────────────────────────
interface ModelFile {
  id: string;
  category: string;
  displayName: string;
  fileName: string;
  lastUpdated: string;
  url: string;
  source: "file" | "url";
}

interface Module {
  id: string;
  module_key: string;
  display_name: string;
  description: string;
  icon: string;
}

interface ModuleItem {
  id: string;
  module_id: string;
  item_name: string;
  description: string;
  display_order: number;
  video_url: string | null;
  image_url: string | null;
}

type TabName = "models" | "content" | "settings";
type MediaType = "none" | "video" | "image";
type ModelSourceType = "file" | "url";

// ─── Component ──────────────────────────────────────
export default function AdminPage() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loginMessage, setLoginMessage] = React.useState<{
    text: string;
    type: "error" | "success";
  } | null>(null);
  const [loginLoading, setLoginLoading] = React.useState(false);

  // Tab state
  const [activeTab, setActiveTab] = React.useState<TabName>("models");

  // Model tab state
  const [models, setModels] = React.useState<ModelFile[]>([]);
  const [modelsLoading, setModelsLoading] = React.useState(false);

  // Model modal state
  const [modelModalOpen, setModelModalOpen] = React.useState(false);
  const [modelModalTitle, setModelModalTitle] = React.useState("Add New Model");
  const [modelCategory, setModelCategory] = React.useState("");
  const [modelDisplayName, setModelDisplayName] = React.useState("");
  const [modelFile, setModelFile] = React.useState<File | null>(null);
  const [modelSourceType, setModelSourceType] = React.useState<ModelSourceType>("file");
  const [modelUrl, setModelUrl] = React.useState("");
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [uploadingModel, setUploadingModel] = React.useState(false);
  const [editingModelId, setEditingModelId] = React.useState<string | null>(
    null
  );

  // Content tab state
  const [modules, setModules] = React.useState<Module[]>([]);
  const [selectedModuleKey, setSelectedModuleKey] = React.useState("");
  const [moduleItems, setModuleItems] = React.useState<ModuleItem[]>([]);
  const [availableModels, setAvailableModels] = React.useState<
    { category: string; displayName: string; fileName: string; source: "file" | "url" }[]
  >([]);
  const [associatedModel, setAssociatedModel] = React.useState("");
  const [modelInfoVisible, setModelInfoVisible] = React.useState(false);
  const [modelAvailable, setModelAvailable] = React.useState(false);

  // Module modal state
  const [moduleModalOpen, setModuleModalOpen] = React.useState(false);
  const [moduleModalTitle, setModuleModalTitle] =
    React.useState("Add New Module");
  const [moduleFormId, setModuleFormId] = React.useState("");
  const [moduleFormKey, setModuleFormKey] = React.useState("");
  const [moduleFormDisplayName, setModuleFormDisplayName] = React.useState("");
  const [moduleFormDescription, setModuleFormDescription] = React.useState("");
  const [moduleFormIcon, setModuleFormIcon] = React.useState("");
  const [moduleKeyDisabled, setModuleKeyDisabled] = React.useState(false);

  // Item modal state
  const [itemModalOpen, setItemModalOpen] = React.useState(false);
  const [itemModalTitle, setItemModalTitle] = React.useState("Add New Item");
  const [itemFormId, setItemFormId] = React.useState("");
  const [itemFormModuleId, setItemFormModuleId] = React.useState("");
  const [itemFormName, setItemFormName] = React.useState("");
  const [itemFormDescription, setItemFormDescription] = React.useState("");
  const [itemFormOrder, setItemFormOrder] = React.useState(1);
  const [itemFormMediaType, setItemFormMediaType] =
    React.useState<MediaType>("none");
  const [itemFormVideoUrl, setItemFormVideoUrl] = React.useState("");
  const [itemFormImageUrl, setItemFormImageUrl] = React.useState("");

  // Settings state
  const [updateInterval, setUpdateInterval] = React.useState("24");
  const [debugOutput, setDebugOutput] = React.useState("");

  // ─── Auth ───────────────────────────────────────
  React.useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function checkAuth() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      setIsAuthenticated(true);
      loadModels();
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginLoading(true);
    setLoginMessage(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setLoginMessage({ text: error.message, type: "error" });
        setLoginLoading(false);
        return;
      }
      setIsAuthenticated(true);
      loadModels();
    } catch {
      setLoginMessage({
        text: "An unexpected error occurred. Please try again.",
        type: "error",
      });
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setEmail("");
    setPassword("");
    setLoginMessage(null);
  }

  // ─── Models Tab ─────────────────────────────────
  async function loadModels() {
    setModelsLoading(true);
    try {
      // 1. Load file-based models from storage
      const { data: files, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .list();
      if (error) throw error;

      const storageModels: ModelFile[] = (files || [])
        .filter((f) => f.name.endsWith(".task"))
        .map((file) => {
          const category = file.name.replace(".task", "");
          return {
            id: file.id || file.name,
            category,
            displayName: MODEL_DISPLAY_NAMES[category] || category,
            fileName: file.name,
            lastUpdated: new Date(
              file.updated_at || file.created_at
            ).toLocaleString(),
            url: `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${file.name}`,
            source: "file" as const,
          };
        });

      // 2. Load URL-based models from module_models table
      const { data: urlModels } = await supabase
        .from("module_models")
        .select("*")
        .eq("is_active", true);

      const urlBasedModels: ModelFile[] = (urlModels || [])
        .filter(
          (m) =>
            m.model_url &&
            !m.model_url.includes(
              `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/`
            )
        )
        .map((m) => ({
          id: m.id,
          category: m.model_category,
          displayName: MODEL_DISPLAY_NAMES[m.model_category] || m.model_category,
          fileName: m.model_file_name || "(external URL)",
          lastUpdated: "",
          url: m.model_url,
          source: "url" as const,
        }));

      // 3. Merge — storage models take priority, then add URL-only ones
      const storageCategories = new Set(storageModels.map((m) => m.category));
      const uniqueUrlModels = urlBasedModels.filter(
        (m) => !storageCategories.has(m.category)
      );

      const mapped = [...storageModels, ...uniqueUrlModels].sort((a, b) =>
        a.category.localeCompare(b.category)
      );
      setModels(mapped);
    } catch (err) {
      console.error("Error loading models:", err);
    } finally {
      setModelsLoading(false);
    }
  }

  function openAddModelModal() {
    setModelModalTitle("Add New Model");
    setModelCategory("");
    setModelDisplayName("");
    setModelFile(null);
    setModelSourceType("file");
    setModelUrl("");
    setUploadProgress(0);
    setEditingModelId(null);
    setModelModalOpen(true);
  }

  function openEditModelModal(model: ModelFile) {
    setModelModalTitle("Update Model");
    setModelCategory(model.category);
    setModelDisplayName(model.displayName);
    setModelFile(null);
    setModelSourceType(model.source);
    setModelUrl(model.source === "url" ? model.url : "");
    setUploadProgress(0);
    setEditingModelId(model.id);
    setModelModalOpen(true);
  }

  async function handleModelSubmit() {
    if (!modelCategory) return;

    if (modelSourceType === "file") {
      // ── File upload mode ──
      if (!modelFile && !editingModelId) {
        toast.warning("Please select a model file to upload.");
        return;
      }

      setUploadingModel(true);
      setUploadProgress(10);

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          toast.error("Session expired. Please log in again.");
          setIsAuthenticated(false);
          return;
        }

        setUploadProgress(30);

        if (modelFile) {
          // Use the expected filename for the category to stay consistent with MODEL_URLS
          const fileName = getExpectedFilename(modelCategory) || modelFile.name;
          const { error } = await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(fileName, modelFile, {
              cacheControl: "3600",
              upsert: true,
            });
          if (error) throw error;
        }

        setUploadProgress(100);
        setModelModalOpen(false);
        loadModels();
        toast.success("Model saved successfully!");
      } catch (err) {
        console.error("Error saving model:", err);
        toast.error(
          `Error saving model: ${err instanceof Error ? err.message : "Unknown error"}`
        );
      } finally {
        setUploadingModel(false);
      }
    } else {
      // ── URL mode ──
      if (!modelUrl.trim()) {
        toast.warning("Please enter a model URL.");
        return;
      }

      setUploadingModel(true);
      setUploadProgress(30);

      try {
        // Validate URL is reachable
        const resp = await fetch(modelUrl.trim(), { method: "HEAD" }).catch(
          () => null
        );
        if (!resp || !resp.ok) {
          const proceed = confirm(
            `Warning: The URL might not be reachable (status: ${resp?.status || "network error"}).\n\nSave anyway?`
          );
          if (!proceed) {
            setUploadingModel(false);
            return;
          }
        }

        setUploadProgress(70);

        // Store as a module_model entry so it appears in the system.
        // We use a placeholder module_id if no module is associated yet.
        // First check if an entry exists for this category.
        const { data: existing } = await supabase
          .from("module_models")
          .select("id")
          .eq("model_category", modelCategory)
          .limit(1);

        if (existing && existing.length > 0) {
          // Update existing entry
          const { error } = await supabase
            .from("module_models")
            .update({
              model_url: modelUrl.trim(),
              model_file_name: new URL(modelUrl.trim()).pathname.split("/").pop() || `${modelCategory}.task`,
              is_active: true,
            })
            .eq("id", existing[0].id);
          if (error) throw error;
        } else {
          // Insert new — we need a module_id. Find matching module or use the category as key.
          const { data: matchingModule } = await supabase
            .from("modules")
            .select("id")
            .eq("module_key", modelCategory)
            .limit(1);

          const moduleId = matchingModule?.[0]?.id;
          if (!moduleId) {
            toast.error(
              "No module found for this category. Please create the module first in the Content tab."
            );
            setUploadingModel(false);
            return;
          }

          const { error } = await supabase.from("module_models").insert({
            module_id: moduleId,
            model_category: modelCategory,
            model_file_name: new URL(modelUrl.trim()).pathname.split("/").pop() || `${modelCategory}.task`,
            model_url: modelUrl.trim(),
            is_active: true,
          });
          if (error) throw error;
        }

        setUploadProgress(100);
        setModelModalOpen(false);
        loadModels();
        toast.success("Model URL saved successfully!");
      } catch (err) {
        console.error("Error saving model URL:", err);
        toast.error(
          `Error saving model: ${err instanceof Error ? err.message : "Unknown error"}`
        );
      } finally {
        setUploadingModel(false);
      }
    }
  }

  async function deleteModel(model: ModelFile) {
    if (
      !confirm(
        `Are you sure you want to delete the ${model.displayName} model?`
      )
    )
      return;
    try {
      if (model.source === "url") {
        // URL-based model: deactivate in module_models table
        const { error } = await supabase
          .from("module_models")
          .update({ is_active: false })
          .eq("id", model.id);
        if (error) throw error;
      } else {
        // File-based model: remove from storage
        const { error } = await supabase.storage
          .from(STORAGE_BUCKET)
          .remove([model.fileName]);
        if (error) throw error;
      }
      loadModels();
      toast.success("Model deleted successfully!");
    } catch (err) {
      console.error("Error deleting model:", err);
      toast.error(
        `Error deleting model: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    }
  }

  // ─── Content Tab ────────────────────────────────
  async function loadContentManagement() {
    await loadModulesFromDatabase();
    await loadAvailableModelsForAssociation();
    setSelectedModuleKey("");
    setModuleItems([]);
    setAssociatedModel("");
    setModelInfoVisible(false);
  }

  async function loadModulesFromDatabase() {
    try {
      const { data, error } = await supabase
        .from("modules")
        .select("*")
        .order("display_name");
      if (error) throw error;
      setModules(data || []);
    } catch (err) {
      console.error("Error loading modules:", err);
    }
  }

  async function loadAvailableModelsForAssociation() {
    try {
      // 1. Storage-based models
      const { data: files, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .list();
      if (error) throw error;

      const storageModels = (files || [])
        .filter((f) => f.name.endsWith(".task"))
        .map((f) => {
          const cat = f.name.replace(".task", "");
          return {
            category: cat,
            displayName: MODEL_DISPLAY_NAMES[cat] || cat,
            fileName: f.name,
            source: "file" as const,
          };
        });

      // 2. URL-based models from module_models
      const { data: urlModels } = await supabase
        .from("module_models")
        .select("*")
        .eq("is_active", true);

      const storageCategories = new Set(storageModels.map((m) => m.category));
      const urlOnlyModels = (urlModels || [])
        .filter(
          (m: { model_url: string; model_category: string }) =>
            m.model_url &&
            !m.model_url.includes(
              `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/`
            ) &&
            !storageCategories.has(m.model_category)
        )
        .map((m: { model_category: string; model_file_name: string }) => ({
          category: m.model_category,
          displayName: MODEL_DISPLAY_NAMES[m.model_category] || m.model_category,
          fileName: m.model_file_name || "(external URL)",
          source: "url" as const,
        }));

      setAvailableModels([...storageModels, ...urlOnlyModels]);
    } catch (err) {
      console.error("Error loading available models:", err);
    }
  }

  async function handleModuleSelection(moduleKey: string) {
    setSelectedModuleKey(moduleKey);
    if (!moduleKey) {
      setModuleItems([]);
      setAssociatedModel("");
      setModelInfoVisible(false);
      return;
    }

    const mod = modules.find((m) => m.module_key === moduleKey);
    if (!mod) return;

    // Load items
    try {
      const { data, error } = await supabase
        .from("module_items")
        .select("*")
        .eq("module_id", mod.id)
        .order("display_order", { ascending: true });
      if (error) throw error;
      setModuleItems(data || []);
    } catch (err) {
      console.error("Error loading module items:", err);
    }

    // Load model association
    try {
      const { data, error } = await supabase
        .from("module_models")
        .select("*")
        .eq("module_id", mod.id)
        .eq("is_active", true)
        .limit(1);
      if (error) throw error;
      if (data && data.length > 0) {
        setAssociatedModel(data[0].model_category);
        await checkModelAvailability(data[0].model_category);
      } else {
        setAssociatedModel("");
        setModelInfoVisible(false);
      }
    } catch (err) {
      console.error("Error loading model association:", err);
    }
  }

  async function checkModelAvailability(category: string) {
    if (!category) {
      setModelInfoVisible(false);
      return;
    }
    const fileName = getExpectedFilename(category);
    try {
      const { data: files, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .list();
      if (!error && files) {
        const found = files.some((f) => f.name === fileName);
        setModelAvailable(found);
      }
    } catch {
      setModelAvailable(false);
    }
    setModelInfoVisible(true);
  }

  // Module CRUD
  function openAddModuleModal() {
    setModuleModalTitle("Add New Module");
    setModuleFormId("");
    setModuleFormKey("");
    setModuleFormDisplayName("");
    setModuleFormDescription("");
    setModuleFormIcon("");
    setModuleKeyDisabled(false);
    setModuleModalOpen(true);
  }

  function openEditModuleModal() {
    const mod = modules.find((m) => m.module_key === selectedModuleKey);
    if (!mod) return;
    setModuleModalTitle("Edit Module");
    setModuleFormId(mod.id);
    setModuleFormKey(mod.module_key);
    setModuleFormDisplayName(mod.display_name);
    setModuleFormDescription(mod.description || "");
    setModuleFormIcon(mod.icon || "");
    setModuleKeyDisabled(true);
    setModuleModalOpen(true);
  }

  async function handleModuleSubmit() {
    const key = moduleFormKey.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!key || key.length < 2) {
      toast.warning(
        "Module key must be at least 2 characters (lowercase letters and numbers only)."
      );
      return;
    }

    try {
      if (moduleFormId) {
        const { error } = await supabase
          .from("modules")
          .update({
            display_name: moduleFormDisplayName,
            description: moduleFormDescription,
            icon: moduleFormIcon,
          })
          .eq("id", moduleFormId);
        if (error) throw error;
      } else {
        const { data: existing } = await supabase
          .from("modules")
          .select("id")
          .eq("module_key", key)
          .limit(1);
        if (existing && existing.length > 0) {
          toast.warning("A module with this key already exists.");
          return;
        }
        const { error } = await supabase.from("modules").insert({
          module_key: key,
          display_name: moduleFormDisplayName,
          description: moduleFormDescription,
          icon: moduleFormIcon,
        });
        if (error) throw error;
      }
      setModuleModalOpen(false);
      await loadModulesFromDatabase();
      toast.success("Module saved successfully!");
    } catch (err) {
      console.error("Error saving module:", err);
      toast.error(
        `Error saving module: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    }
  }

  async function handleDeleteModule() {
    if (!selectedModuleKey) return;
    const mod = modules.find((m) => m.module_key === selectedModuleKey);
    if (!mod) return;

    if (
      !confirm(
        `Are you sure you want to delete "${mod.display_name}"?\n\nThis will also delete all items in this module.\nThis action cannot be undone.`
      )
    )
      return;

    try {
      const { error } = await supabase
        .from("modules")
        .delete()
        .eq("id", mod.id);
      if (error) throw error;
      setSelectedModuleKey("");
      setModuleItems([]);
      await loadModulesFromDatabase();
      toast.success("Module deleted successfully.");
    } catch (err) {
      console.error("Error deleting module:", err);
      toast.error(
        `Error deleting module: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    }
  }

  // Item CRUD
  function openAddItemModal() {
    const mod = modules.find((m) => m.module_key === selectedModuleKey);
    if (!mod) return;
    const nextOrder =
      Math.max(0, ...moduleItems.map((i) => i.display_order)) + 1;
    setItemModalTitle("Add New Item");
    setItemFormId("");
    setItemFormModuleId(mod.id);
    setItemFormName("");
    setItemFormDescription("");
    setItemFormOrder(nextOrder);
    setItemFormMediaType("none");
    setItemFormVideoUrl("");
    setItemFormImageUrl("");
    setItemModalOpen(true);
  }

  function openEditItemModal(item: ModuleItem) {
    setItemModalTitle("Edit Item");
    setItemFormId(item.id);
    setItemFormModuleId(item.module_id);
    setItemFormName(item.item_name);
    setItemFormDescription(item.description || "");
    setItemFormOrder(item.display_order);
    if (item.video_url) {
      setItemFormMediaType("video");
      setItemFormVideoUrl(item.video_url);
      setItemFormImageUrl("");
    } else if (item.image_url) {
      setItemFormMediaType("image");
      setItemFormImageUrl(item.image_url);
      setItemFormVideoUrl("");
    } else {
      setItemFormMediaType("none");
      setItemFormVideoUrl("");
      setItemFormImageUrl("");
    }
    setItemModalOpen(true);
  }

  async function handleItemSubmit() {
    if (!itemFormName.trim()) return;

    let videoUrl: string | null = null;
    let imageUrl: string | null = null;
    if (itemFormMediaType === "video") {
      if (!itemFormVideoUrl.trim()) {
        toast.warning("Please enter a video URL.");
        return;
      }
      videoUrl = itemFormVideoUrl.trim();
    } else if (itemFormMediaType === "image") {
      if (!itemFormImageUrl.trim()) {
        toast.warning("Please enter an image URL.");
        return;
      }
      imageUrl = itemFormImageUrl.trim();
    }

    try {
      if (itemFormId) {
        const { error } = await supabase
          .from("module_items")
          .update({
            item_name: itemFormName,
            description: itemFormDescription,
            display_order: itemFormOrder,
            video_url: videoUrl,
            image_url: imageUrl,
          })
          .eq("id", itemFormId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("module_items").insert({
          module_id: itemFormModuleId,
          item_name: itemFormName,
          description: itemFormDescription,
          display_order: itemFormOrder,
          video_url: videoUrl,
          image_url: imageUrl,
        });
        if (error) throw error;
      }
      setItemModalOpen(false);
      await handleModuleSelection(selectedModuleKey);
      toast.success("Item saved successfully!");
    } catch (err) {
      console.error("Error saving item:", err);
      toast.error(
        `Error saving item: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    }
  }

  async function handleDeleteItem(item: ModuleItem) {
    if (
      !confirm(
        `Are you sure you want to delete "${item.item_name}"?\nThis action cannot be undone.`
      )
    )
      return;
    try {
      const { error } = await supabase
        .from("module_items")
        .delete()
        .eq("id", item.id);
      if (error) throw error;
      await handleModuleSelection(selectedModuleKey);
      toast.success("Item deleted successfully.");
    } catch (err) {
      console.error("Error deleting item:", err);
      toast.error(
        `Error deleting item: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    }
  }

  // Model association
  async function handleSaveAssociation() {
    if (!selectedModuleKey || !associatedModel) return;
    const mod = modules.find((m) => m.module_key === selectedModuleKey);
    if (!mod) return;

    // Check if there's a URL-based model for this category
    const existingModel = models.find((m) => m.category === associatedModel);
    let modelUrlToSave: string;
    let fileName: string;

    if (existingModel?.source === "url") {
      // External URL model
      modelUrlToSave = existingModel.url;
      fileName = existingModel.fileName;
    } else {
      // Storage-based model — construct URL
      fileName = getExpectedFilename(associatedModel);
      modelUrlToSave = `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${fileName}`;
    }

    try {
      // Deactivate existing
      await supabase
        .from("module_models")
        .update({ is_active: false })
        .eq("module_id", mod.id);

      // Upsert new
      const { error } = await supabase.from("module_models").upsert(
        {
          module_id: mod.id,
          model_category: associatedModel,
          model_file_name: fileName,
          model_url: modelUrlToSave,
          is_active: true,
        },
        { onConflict: "module_id,model_category" }
      );
      if (error) throw error;
      alert("Model association saved successfully!");
    } catch (err) {
      console.error("Error saving association:", err);
      alert(
        `Error saving association: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    }
  }

  async function handleTestModel() {
    if (!associatedModel) return;

    // Find the actual model entry to get the correct URL
    const existingModel = models.find((m) => m.category === associatedModel);
    let testUrl: string;

    if (existingModel?.source === "url") {
      testUrl = existingModel.url;
    } else {
      const fileName = getExpectedFilename(associatedModel);
      testUrl = `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${fileName}`;
    }

    try {
      const resp = await fetch(testUrl, { method: "HEAD" });
      if (resp.ok) {
        alert(
          `✅ Model test successful!\n\nThe ${MODEL_DISPLAY_NAMES[associatedModel] || associatedModel} model is accessible and ready to use.\n\nSource: ${existingModel?.source === "url" ? "External URL" : "Storage File"}\nURL: ${testUrl}`
        );
      } else {
        alert(
          `❌ Model test failed!\n\nHTTP ${resp.status}. Please check if the model file exists.\nURL: ${testUrl}`
        );
      }
    } catch (err) {
      alert(
        `❌ Model test failed!\n\nError: ${err instanceof Error ? err.message : "Unknown error"}\nURL: ${testUrl}`
      );
    }
  }

  // ─── Settings Tab ───────────────────────────────
  async function runStorageDebug() {
    setDebugOutput("Running storage diagnostics...\n");
    const results: string[] = ["===== SUPABASE STORAGE DEBUG ====="];

    const {
      data: { session },
    } = await supabase.auth.getSession();
    results.push(`Authenticated: ${!!session}`);
    if (session) {
      results.push(`User ID: ${session.user.id}`);
      results.push(`User email: ${session.user.email}`);
    }

    results.push(`\nListing files in "${STORAGE_BUCKET}" bucket...`);
    try {
      const { data: files, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .list();
      if (error) {
        results.push(`ERROR: ${error.message}`);
      } else if (files && files.length > 0) {
        results.push(`SUCCESS: Found ${files.length} files`);
        results.push(`Files: ${files.map((f) => f.name).join(", ")}`);
      } else {
        results.push("Bucket exists but contains no files");
      }
    } catch (e) {
      results.push(
        `ERROR: ${e instanceof Error ? e.message : "Unknown error"}`
      );
    }

    results.push("\nTesting upload permissions...");
    try {
      const testContent = new Blob(["test"], { type: "text/plain" });
      const testName = `permission_test_${Date.now()}.txt`;
      const { error: upErr } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(testName, testContent);
      if (upErr) {
        results.push(`Upload test FAILED: ${upErr.message}`);
      } else {
        results.push("Upload test: SUCCESS");
        const { error: delErr } = await supabase.storage
          .from(STORAGE_BUCKET)
          .remove([testName]);
        results.push(
          delErr
            ? `Delete test FAILED: ${delErr.message}`
            : "Delete test: SUCCESS"
        );
      }
    } catch (e) {
      results.push(
        `Permission test error: ${e instanceof Error ? e.message : "Unknown error"}`
      );
    }

    results.push("\n===== DEBUG COMPLETE =====");
    setDebugOutput(results.join("\n"));
  }

  async function runModelVerification() {
    setDebugOutput("Verifying model URLs...\n");
    const results: string[] = ["===== MODEL URL VERIFICATION ====="];

    const categories = Object.keys(MODEL_DISPLAY_NAMES);
    results.push(`Testing ${categories.length} model URLs...\n`);

    for (const cat of categories) {
      const fileName = getExpectedFilename(cat);
      const url = `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${fileName}`;
      results.push(`Testing: ${cat} (${fileName})`);
      results.push(`URL: ${url}`);
      try {
        const resp = await fetch(url, { method: "HEAD" });
        results.push(
          resp.ok
            ? `✅ Accessible (${resp.status})`
            : `❌ Failed (${resp.status})`
        );
      } catch (e) {
        results.push(
          `❌ Error: ${e instanceof Error ? e.message : "Network error"}`
        );
      }
      results.push("");
    }
    results.push("===== VERIFICATION COMPLETE =====");
    setDebugOutput(results.join("\n"));
  }

  // ─── Tab switch ─────────────────────────────────
  function switchTab(tab: TabName) {
    setActiveTab(tab);
    if (tab === "models") loadModels();
    if (tab === "content") loadContentManagement();
  }

  // ─── Auto-fill display name when category changes ──
  React.useEffect(() => {
    if (modelCategory && MODEL_DISPLAY_NAMES[modelCategory]) {
      setModelDisplayName(MODEL_DISPLAY_NAMES[modelCategory]);
    }
  }, [modelCategory]);

  // ─── Selected module helper ─────────────────────
  const selectedModule = modules.find(
    (m) => m.module_key === selectedModuleKey
  );

  // ════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════

  // ─── Login Screen ───────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-sm">
        <Card>
          <CardHeader className="text-center">
            <Settings className="size-10 text-(--brand-1) mx-auto mb-2" />
            <CardTitle>⚙️ Admin Authentication</CardTitle>
            <CardDescription>
              Please log in to access the admin dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@signademy.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {loginMessage && (
                <Alert
                  variant={
                    loginMessage.type === "error" ? "destructive" : "default"
                  }
                >
                  <AlertDescription>{loginMessage.text}</AlertDescription>
                </Alert>
              )}
              <Button
                type="submit"
                className="w-full rounded-full bg-linear-to-r from-(--brand-1) to-(--brand-2) text-white"
                disabled={loginLoading}
              >
                {loginLoading ? "Logging in..." : "Log In"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Dashboard ──────────────────────────────────
  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight flex items-center gap-2 font-display">
            <LayoutDashboard className="size-7 text-(--brand-1)" />
            <span className="bg-linear-to-r from-(--brand-1) to-(--brand-2) bg-clip-text text-transparent">
              Admin Dashboard
            </span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage models, content, and settings.
          </p>
        </div>
        <Button variant="outline" onClick={handleLogout} className="gap-2">
          <LogOut className="size-4" />
          Log Out
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b">
        {(
          [
            { id: "models" as TabName, label: "Models", icon: Upload },
            {
              id: "content" as TabName,
              label: "Content Management",
              icon: BookOpen,
            },
            { id: "settings" as TabName, label: "Settings", icon: Settings },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => switchTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab.id
                ? "border-(--brand-1) text-(--brand-1)"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="size-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ═══ Models Tab ═══ */}
      {activeTab === "models" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Model Management</h2>
            <Button
              onClick={openAddModelModal}
              className="rounded-full bg-linear-to-r from-(--brand-1) to-(--brand-2) text-white gap-2"
            >
              <Plus className="size-4" />
              Add New Model
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Display Name</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>File / URL</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modelsLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Loading models...
                      </TableCell>
                    </TableRow>
                  ) : models.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        No models found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    models.map((model) => (
                      <TableRow key={model.id}>
                        <TableCell className="font-medium">
                          {model.category}
                        </TableCell>
                        <TableCell>{model.displayName}</TableCell>
                        <TableCell>
                          <Badge variant={model.source === "file" ? "default" : "secondary"}>
                            {model.source === "file" ? "📁 File" : "🔗 URL"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {model.source === "file" ? (
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {model.fileName}
                            </code>
                          ) : (
                            <span className="text-xs text-muted-foreground truncate max-w-50 block" title={model.url}>
                              {model.url.length > 50 ? model.url.slice(0, 50) + "…" : model.url}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {model.lastUpdated || "—"}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openEditModelModal(model)}
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => deleteModel(model)}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ═══ Content Tab ═══ */}
      {activeTab === "content" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-1">Content Management</h2>
            <p className="text-sm text-muted-foreground">
              Manage modules, their items, and associate models.
            </p>
          </div>

          {/* Step 1: Select Module */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="rounded-full size-6 flex items-center justify-center p-0 text-xs"
                >
                  1
                </Badge>
                Select or Manage Module
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3 items-end flex-wrap">
                <div className="flex-1 min-w-50">
                  <Label>Choose Module</Label>
                  <Select
                    value={selectedModuleKey}
                    onValueChange={handleModuleSelection}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="-- Select a Module --" />
                    </SelectTrigger>
                    <SelectContent>
                      {modules.map((mod) => (
                        <SelectItem key={mod.module_key} value={mod.module_key}>
                          {mod.icon} {mod.display_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={openAddModuleModal}
                    className="gap-1"
                  >
                    <Plus className="size-3.5" />
                    Add
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openEditModuleModal}
                    disabled={!selectedModuleKey}
                    className="gap-1"
                  >
                    <Pencil className="size-3.5" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteModule}
                    disabled={!selectedModuleKey}
                    className="gap-1"
                  >
                    <Trash2 className="size-3.5" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Manage Items */}
          {selectedModuleKey && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="rounded-full size-6 flex items-center justify-center p-0 text-xs"
                    >
                      2
                    </Badge>
                    Manage Items in{" "}
                    {selectedModule?.display_name || selectedModuleKey}
                  </CardTitle>
                  <Button
                    size="sm"
                    onClick={openAddItemModal}
                    className="gap-1"
                  >
                    <Plus className="size-3.5" />
                    Add New Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {moduleItems.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ListChecks className="size-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No items in this module</p>
                    <p className="text-sm">
                      Click &quot;Add New Item&quot; to add content.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {moduleItems.map((item) => (
                      <div
                        key={item.id}
                        className="border rounded-lg p-3 flex items-center justify-between"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate">
                            {item.item_name}
                          </p>
                          <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                            <span>#{item.display_order}</span>
                            <span
                              className={
                                item.video_url
                                  ? "text-green-600"
                                  : "text-red-400"
                              }
                            >
                              Video: {item.video_url ? "✓" : "✗"}
                            </span>
                            <span
                              className={
                                item.image_url
                                  ? "text-green-600"
                                  : "text-red-400"
                              }
                            >
                              Image: {item.image_url ? "✓" : "✗"}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1 ml-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => openEditItemModal(item)}
                          >
                            <Pencil className="size-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteItem(item)}
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 3: Associate Model */}
          {selectedModuleKey && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="rounded-full size-6 flex items-center justify-center p-0 text-xs"
                  >
                    3
                  </Badge>
                  Associate Model (Required)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>
                    Select Model for{" "}
                    {selectedModule?.display_name || selectedModuleKey}
                  </Label>
                  <Select
                    value={associatedModel}
                    onValueChange={async (v) => {
                      setAssociatedModel(v);
                      await checkModelAvailability(v);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="-- Select a Model --" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableModels.map((m) => (
                        <SelectItem key={m.category} value={m.category}>
                          {m.source === "url" ? "🔗 " : "📁 "}
                          {m.displayName} ({m.fileName})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {modelInfoVisible && associatedModel && (
                  <div className="rounded-lg border p-4 space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {MODEL_DISPLAY_NAMES[associatedModel] ||
                          associatedModel}
                      </span>
                      <Badge
                        variant={modelAvailable ? "default" : "destructive"}
                      >
                        {modelAvailable ? "Available" : "Missing"}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-y-1 text-xs text-muted-foreground">
                      <span>File Name:</span>
                      <span>{getExpectedFilename(associatedModel)}</span>
                      <span>Category:</span>
                      <span>{associatedModel}</span>
                      <span>Status:</span>
                      <span>
                        {modelAvailable ? "Ready to use" : "Upload required"}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveAssociation}
                    disabled={!associatedModel}
                    className="gap-1"
                  >
                    <Check className="size-4" />
                    Save Association
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleTestModel}
                    disabled={!associatedModel}
                    className="gap-1"
                  >
                    <ChevronRight className="size-4" />
                    Test Model
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ═══ Settings Tab ═══ */}
      {activeTab === "settings" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Admin Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Storage Bucket Name</Label>
                <Input value={STORAGE_BUCKET} disabled />
                <p className="text-xs text-muted-foreground">
                  Supabase storage bucket where models are stored.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Model Update Check Interval (hours)</Label>
                <Input
                  type="number"
                  min={1}
                  max={48}
                  value={updateInterval}
                  onChange={(e) => setUpdateInterval(e.target.value)}
                />
              </div>
              <Button
                onClick={() => {
                  localStorage.setItem("model_update_interval", updateInterval);
                  alert("Settings saved successfully!");
                }}
              >
                Save Settings
              </Button>
            </CardContent>
          </Card>

          <Separator />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Troubleshooting</CardTitle>
              <CardDescription>
                Run diagnostics to debug storage permissions or verify model
                URLs.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button variant="outline" onClick={runStorageDebug}>
                  Debug Storage Permissions
                </Button>
                <Button variant="outline" onClick={runModelVerification}>
                  Verify Model URLs
                </Button>
              </div>
              <Textarea
                readOnly
                value={debugOutput}
                className="font-mono text-xs h-52"
                placeholder="Debug output will appear here..."
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* ═══ Model Upload Modal ═══ */}
      <Dialog open={modelModalOpen} onOpenChange={setModelModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{modelModalTitle}</DialogTitle>
            <DialogDescription>
              Add a model by uploading a .task file or providing an external URL.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Model Category *</Label>
              <Select value={modelCategory} onValueChange={setModelCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(MODEL_DISPLAY_NAMES).map(([key, name]) => (
                    <SelectItem key={key} value={key}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Display Name *</Label>
              <Input
                value={modelDisplayName}
                onChange={(e) => setModelDisplayName(e.target.value)}
                required
              />
            </div>

            {/* Source Type Toggle */}
            <div className="space-y-2">
              <Label>Model Source *</Label>
              <div className="flex gap-3">
                {(
                  [
                    { value: "file" as ModelSourceType, label: "📁 Upload File" },
                    { value: "url" as ModelSourceType, label: "🔗 External URL" },
                  ] as const
                ).map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-2 cursor-pointer rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors flex-1 justify-center ${
                      modelSourceType === opt.value
                        ? "border-(--brand-1) bg-(--brand-1)/10"
                        : "hover:bg-accent"
                    }`}
                  >
                    <input
                      type="radio"
                      name="modelSourceType"
                      value={opt.value}
                      checked={modelSourceType === opt.value}
                      onChange={() => setModelSourceType(opt.value)}
                      className="sr-only"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            {/* File Upload */}
            {modelSourceType === "file" && (
              <>
                {modelCategory && (
                  <Alert>
                    <AlertDescription>
                      <span className="text-xs">
                        Uploading will use the file&apos;s original name. Uploading a file
                        with the same name will replace the existing model.
                      </span>
                    </AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label>Model File (.task) {editingModelId ? "" : "*"}</Label>
                  <Input
                    type="file"
                    accept=".task"
                    onChange={(e) => setModelFile(e.target.files?.[0] || null)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Only .task files are supported for MediaPipe models.
                  </p>
                </div>
              </>
            )}

            {/* URL Input */}
            {modelSourceType === "url" && (
              <div className="space-y-2">
                <Label>Model URL *</Label>
                <Input
                  type="url"
                  value={modelUrl}
                  onChange={(e) => setModelUrl(e.target.value)}
                  placeholder="https://example.com/model.task"
                />
                <p className="text-xs text-muted-foreground">
                  Direct link to a .task model file hosted externally.
                </p>
              </div>
            )}

            {uploadingModel && (
              <div className="space-y-1">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {uploadProgress}%
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setModelModalOpen(false)}
              disabled={uploadingModel}
            >
              Cancel
            </Button>
            <Button onClick={handleModelSubmit} disabled={uploadingModel}>
              {uploadingModel ? "Saving..." : "Save Model"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══ Module Modal ═══ */}
      <Dialog open={moduleModalOpen} onOpenChange={setModuleModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{moduleModalTitle}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Module Key *</Label>
              <Input
                value={moduleFormKey}
                onChange={(e) => setModuleFormKey(e.target.value)}
                placeholder="e.g., animals, weather"
                disabled={moduleKeyDisabled}
              />
              <p className="text-xs text-muted-foreground">
                Lowercase letters only, no spaces.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Display Name *</Label>
              <Input
                value={moduleFormDisplayName}
                onChange={(e) => setModuleFormDisplayName(e.target.value)}
                placeholder="e.g., Animals, Weather"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={moduleFormDescription}
                onChange={(e) => setModuleFormDescription(e.target.value)}
                placeholder="Brief description..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Icon (emoji)</Label>
              <Input
                value={moduleFormIcon}
                onChange={(e) => setModuleFormIcon(e.target.value)}
                placeholder="🐾"
                maxLength={2}
                className="w-20"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setModuleModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleModuleSubmit}>Save Module</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══ Item Modal ═══ */}
      <Dialog open={itemModalOpen} onOpenChange={setItemModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{itemModalTitle}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Item Name *</Label>
              <Input
                value={itemFormName}
                onChange={(e) => setItemFormName(e.target.value)}
                placeholder="e.g., Hello, Apple, Red"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={itemFormDescription}
                onChange={(e) => setItemFormDescription(e.target.value)}
                placeholder="Brief description of this sign..."
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Display Order</Label>
              <Input
                type="number"
                min={1}
                value={itemFormOrder}
                onChange={(e) => setItemFormOrder(parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="space-y-2">
              <Label>Media Type</Label>
              <div className="flex gap-4">
                {(
                  [
                    { value: "none", label: "No Media" },
                    { value: "video", label: "🎬 Video" },
                    { value: "image", label: "🖼️ Image" },
                  ] as const
                ).map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-2 cursor-pointer rounded-lg border px-3 py-2 text-sm transition-colors ${
                      itemFormMediaType === opt.value
                        ? "border-(--brand-1) bg-(--brand-1)/10"
                        : "hover:bg-accent"
                    }`}
                  >
                    <input
                      type="radio"
                      name="mediaType"
                      value={opt.value}
                      checked={itemFormMediaType === opt.value}
                      onChange={() => {
                        setItemFormMediaType(opt.value);
                        if (opt.value !== "video") setItemFormVideoUrl("");
                        if (opt.value !== "image") setItemFormImageUrl("");
                      }}
                      className="sr-only"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
            {itemFormMediaType === "video" && (
              <div className="space-y-2">
                <Label>Video URL *</Label>
                <Input
                  type="url"
                  value={itemFormVideoUrl}
                  onChange={(e) => setItemFormVideoUrl(e.target.value)}
                  placeholder="https://example.com/video.mp4"
                />
              </div>
            )}
            {itemFormMediaType === "image" && (
              <div className="space-y-2">
                <Label>Image URL *</Label>
                <Input
                  type="url"
                  value={itemFormImageUrl}
                  onChange={(e) => setItemFormImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setItemModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleItemSubmit}>Save Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
