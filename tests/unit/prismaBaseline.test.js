const test = require('node:test');
const assert = require('node:assert/strict');
const { listMigrationNames } = require('../../scripts/prisma-baseline');

test('listMigrationNames deve listar pastas de migration ordenadas', () => {
  const names = listMigrationNames();

  assert.ok(names.length >= 2);
  assert.equal(names[0], '20260703232817_init');
  assert.equal(names[1], '20260704000253_portal_runtime');
  assert.deepEqual(names, [...names].sort());
});
