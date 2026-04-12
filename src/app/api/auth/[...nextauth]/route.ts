import { handlers } from "@/auth";

/** Node: Prisma/native engine só em rotas Node (evita Edge em stacks híbridas). */
export const runtime = "nodejs";

export const { GET, POST } = handlers;
