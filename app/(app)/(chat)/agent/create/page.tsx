import AgentForm from "@/components/agent/AgentForm";

export default function CreateAgentPage() {
  return (
    <div className="flex h-dvh justify-center gap-6 overflow-y-auto p-6 pt-10">
      <div className="flex flex-col gap-6">
        <AgentForm />
      </div>
    </div>
  );
}
