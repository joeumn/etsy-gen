function readPackage(pkg) {
  if (pkg.name === 'prisma' || pkg.name === '@prisma/client') {
    pkg.scripts = pkg.scripts || {};
    delete pkg.scripts.preinstall;
    delete pkg.scripts.install;
    delete pkg.scripts.postinstall;
  }
  return pkg;
}

module.exports = {
  hooks: {
    readPackage,
  },
};
