import catalog from "../catalog.js";

export default function handler(req, res) {
  const { id } = req.query;
  return catalog(req, res, id);
}
