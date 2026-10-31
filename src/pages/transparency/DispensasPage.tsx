import ComprasConsulta from "@/components/transparency/compras/ComprasConsulta";
import { configProcesso } from "@/components/transparency/compras/processos";

// Contratações diretas: mesma tela de detalhe das licitações (itens, empenhos, contratos e arquivos).
const config = configProcesso("dispensas", "Contratação direta");
const DispensasPage = () => <ComprasConsulta config={config} />;

export default DispensasPage;
