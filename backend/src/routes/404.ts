import {app} from "@/index";

app.all("*", (req, res) => res.sendStatus(404));