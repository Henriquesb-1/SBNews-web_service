export default function parseDate(date: any) {
    const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

    date = new Date(`${date}`).toLocaleDateString("pt-br");
    date = date.split("/");
    
    date[0] = Number.parseInt(date[0]);
    date[1] = Number.parseInt(date[1]);
    
    date[0] = date[0] + 1;
    date[1] = months[date[1] - 1];
    
    return date.join(" de ");
}