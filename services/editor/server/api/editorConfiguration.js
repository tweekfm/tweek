import authenticatedClient from '../auth/authenticatedClient';

export async function getConfiguration(req, res, { tweekApiHostname }, { params }) {
  const keyPath = params[0];
  const tweekApiClient = await authenticatedClient({ baseURL: tweekApiHostname });
  const user = (req.user && req.user.email) || 'unknown';

  const response = await tweekApiClient.get(
    `/api/v1/keys/@tweek/editor/${keyPath}?tweek_editor_user=${user}`,
  );
  res.json(response.data);
}
