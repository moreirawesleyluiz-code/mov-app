import { redirect } from "next/navigation";

/** Evita 404 quando alguém interpreta "app/chat" como caminho. */
export default function AppChatAliasPage() {
  redirect("/app");
}
