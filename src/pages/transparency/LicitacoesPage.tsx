import ComprasConsulta from "@/components/transparency/compras/ComprasConsulta";
import { configProcesso } from "@/components/transparency/compras/processos";

const config = configProcesso("licitacoes", "Licitação");
const LicitacoesPage = () => <ComprasConsulta config={config} />;

export default LicitacoesPage;
