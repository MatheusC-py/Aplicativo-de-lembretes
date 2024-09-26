const { select, input, checkbox } = require('@inquirer/prompts');
const fs = require("fs").promises;

let mensagem = "Bem-vindo ao app de Metas";
let metas;

const carregarMetas = async () => {
    try {
        const dados = await fs.readFile("metas.json", "utf-8");
        metas = JSON.parse(dados);
    } catch (erro) {
        metas = [];
    }
}

const salvarMetas = async () => {
    await fs.writeFile("metas.json", JSON.stringify(metas, null, 2));
}

const cadastrarMeta = async () => {
    const meta = await input({ message: "Digite a meta" });
    if (meta.length === 0) {
        mensagem = "A meta não pode ser vazia";
        return;
    }

    metas.push({ value: meta, checked: false });
    mensagem = "Meta cadastrada com sucesso!";
}

const listarMetas = async () => {
    if (metas.length === 0) {
        mensagem = "Não existem metas";
        return;
    }
    const respostas = await checkbox({
        message: "Use a seta para mudar de metas, o espaço para marcar e desmarcar e o enter para finalizar a etapa",
        choices: metas.map(m => ({ name: m.value, value: m.value, checked: m.checked })),
        instructions: false
    });

    metas.forEach((m) => { m.checked = false; });

    if (respostas.length === 0) {
        console.log("Nenhuma meta selecionada");
        return;
    }

    respostas.forEach((resposta) => {
        const meta = metas.find((m) => m.value === resposta);
        if (meta) meta.checked = true;
    });

    mensagem = "Meta(s) concluídas";
}

const metasRealizadas = async () => {
    if (metas.length === 0) {
        mensagem = "Não existem metas";
        return;
    }

    const realizadas = metas.filter((meta) => meta.checked);

    if (realizadas.length === 0) {
        mensagem = "Você ainda não realizou nenhuma meta";
        return;
    }

    await select({
        message: "Metas realizadas: " + realizadas.length,
        choices: realizadas.map(m => ({ name: m.value, value: m.value }))
    });
}

const metasAbertas = async () => {
    if (metas.length === 0) {
        mensagem = "Não existem metas";
        return;
    }

    const abertas = metas.filter((meta) => !meta.checked);

    if (abertas.length === 0) {
        mensagem = "Você não possui metas abertas!";
        return;
    }

    await select({
        message: "Metas abertas: " + abertas.length,
        choices: abertas.map(m => ({ name: m.value, value: m.value }))
    });
}

const deletarMetas = async () => {
    if (metas.length === 0) {
        mensagem = "Não existem metas";
        return;
    }

    const metasDesmarcadas = metas.map((m) => ({ value: m.value, checked: false }));

    const selecionadas = await checkbox({
        message: "Selecione um item para deletar",
        choices: metasDesmarcadas,
        instructions: false
    });

    if (selecionadas.length === 0) {
        mensagem = "Nenhuma meta selecionada para ser deletada";
        return;
    }

    metas = metas.filter((meta) => !selecionadas.includes(meta.value));
    mensagem = "Meta(s) deletada(s) com sucesso!";
}

const monstrarMensagem = () => {
    console.clear();
    if (mensagem) {
        console.log(mensagem);
        console.log("");
        mensagem = "";
    }
}

const start = async () => {
    await carregarMetas();

    while (true) {
        monstrarMensagem();
        const opcao = await select({
            message: "Menu >",
            choices: [
                { name: "Cadastrar meta", value: "cadastrar" },
                { name: "Listar metas", value: "listar" },
                { name: "Metas realizadas", value: "realizadas" },
                { name: "Metas abertas", value: "abertas" },
                { name: "Deletar metas", value: "deletar" },
                { name: "Sair", value: "sair" }
            ]
        });

        switch (opcao) {
            case "cadastrar":
                await cadastrarMeta();
                break;
            case "listar":
                await listarMetas();
                break;
            case "realizadas":
                await metasRealizadas();
                break;
            case "abertas":
                await metasAbertas();
                break;
            case "deletar":
                await deletarMetas();
                break;
            case "sair":
                console.log("Até a próxima");
                await salvarMetas(); // Salva as metas antes de sair
                return;
        }

        await salvarMetas(); // Salva as metas após cada operação
    }
}

start();
