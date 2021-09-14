use hdk::prelude::*;

#[hdk_entry(id = "test_entry", visibility = "private")]
#[derive(Clone)]
pub struct TestEntry(String);

impl Into<String> for TestEntry {
    fn into(self) -> String {
        self.0
    }
}

entry_defs![
    Path::entry_def(),
    TestEntry::entry_def()
];

fn inbox_hash() -> ExternResult<EntryHash> {
    let path = Path::from("inbox");
    path.ensure()?;
    Ok(path.hash()?)
}

#[hdk_extern]
pub fn create(message: String) -> ExternResult<()> {
    let entry = TestEntry(message);
    let entry_hash = hash_entry(&entry)?;
    create_entry(entry)?;
    create_link(inbox_hash()?, entry_hash, LinkTag::new(String::from("message")))?;
    debug!("Link created");
    Ok(())
}

#[hdk_extern]
pub fn fetch_inbox(_: ()) -> ExternResult<Vec<String>> {
    let mut result = Vec::new();
    debug!("Agent looking for links: {:?}", agent_info()?.agent_latest_pubkey);
    for link in get_links(inbox_hash()?, Some(LinkTag::new(String::from("message"))))?.into_inner() {
        debug!("Link found: {:?}", link);
        let entry = get(link.target, GetOptions::latest())?.unwrap();
        let test_entry = TestEntry::try_from(entry)?;
        result.push(test_entry.into());
    }
    Ok(result)
}
