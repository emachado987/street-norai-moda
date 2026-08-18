const { applicationDefault, initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

const email = process.argv[2]?.trim();
if (!email) {
  console.error('Uso: npm run set-admin -- correo@ejemplo.com');
  process.exit(1);
}

initializeApp({ credential: applicationDefault() });

getAuth().getUserByEmail(email)
  .then(async (user) => {
    if (!user.emailVerified) {
      throw new Error('El correo de Firebase Auth debe estar verificado antes de conceder admin.');
    }
    await getAuth().setCustomUserClaims(user.uid, { ...user.customClaims, admin: true });
    console.log(`Permiso editorial activado para ${email}. La cuenta debe volver a iniciar sesión.`);
  })
  .catch((error) => {
    console.error('No se pudo activar el permiso editorial:', error.message);
    process.exitCode = 1;
  });
