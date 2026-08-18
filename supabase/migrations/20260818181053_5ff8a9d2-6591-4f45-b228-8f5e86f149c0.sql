UPDATE public.vereadores
SET foto_url = '/vereadores/' || slug || '.webp'
WHERE slug IN (
  'gabrielly-vieira-kochhann','lucas-daniel-goncalves-da-silva','enirce-calixto-da-silva',
  'josemar-francisco-de-lima','diego-andre-nascimento','rodrigo-almeida-da-silva',
  'vinicius-camilo-de-souza','willya-jose-da-silva','hugo-josue-de-jesus'
);