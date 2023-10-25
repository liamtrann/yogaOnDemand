import {app} from "@/index";
import * as express from "express";

app.use(express.json({
	limit: '10mb',
}));

app.use(express.urlencoded({
	extended: true,
	limit: '10mb',
}));