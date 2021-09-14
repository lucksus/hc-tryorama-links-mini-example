import { Orchestrator, Config, InstallAgentsHapps, TransportConfigType } from "@holochain/tryorama";
import path from "path";

export const sleep = ms => new Promise(r => setTimeout(r, ms))

const conductorConfig = Config.gen();
const dm = path.join(__dirname, "../workdir/links-test.dna");
const installation: InstallAgentsHapps = [
  // agent 0
  [
    // happ 0
    [dm],
  ],
  // agent 1
  //[
    // happ 0
  //  [dm],
  //],
];

const ZOME = "links-test"

const orchestrator = new Orchestrator();

orchestrator.registerScenario("Show that links can be shared across agents", async (s, t) => {
  const [alice, bob] = await s.players([conductorConfig, conductorConfig]);
  //const [alice] = await s.players([conductorConfig]);
  const [[alice_dm]] = await alice.installAgentsHapps(installation);
  //const [[alice_dm], [bob_dm]] = await alice.installAgentsHapps(installation);
  const [[bob_dm]] = await bob.installAgentsHapps(installation);

  await sleep(2000)

  await s.shareAllNodes([alice, bob])

  // ----------------------------------------------
  // ------------- Setup done ---------------------
  // ----------------------------------------------

  await alice_dm.cells[0].call(ZOME, "create", "test message");
  const alices_entries = await alice_dm.cells[0].call(ZOME, "fetch_inbox");
  t.equal(alices_entries.length, 1)

  await sleep(10000)

  const bobs_entries = await bob_dm.cells[0].call(ZOME, "fetch_inbox");
  t.equal(bobs_entries.length, 1)
});

orchestrator.run();
