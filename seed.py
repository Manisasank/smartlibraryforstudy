from db import init_db, get_db
from auth import make_password

init_db()
c=get_db()

demo=[
("Library Administrator","admin@smartlib.com","admin123","admin","ADM-001"),
("Library Staff","staff@smartlib.com","staff123","staff","STF-001"),
("Demo Student","student@smartlib.com","student123","student","STU-001"),
]
for name,email,pwd,role,ident in demo:
    c.execute("""INSERT OR IGNORE INTO users(name,email,password,role,identifier,phone,department,status)
                 VALUES(?,?,?,?,?,?,?,?)""",(name,email,make_password(pwd),role,ident,"","General","active"))

cats={r["name"]:r["id"] for r in c.execute("SELECT id,name FROM categories")}
books=[
("9780131103627","The C Programming Language","Brian Kernighan","Computer Science","Prentice Hall",1988,4,"CS-A1"),
("9780132350884","Clean Code","Robert C. Martin","Computer Science","Prentice Hall",2008,3,"CS-A2"),
("9780262033848","Introduction to Algorithms","Thomas H. Cormen","Computer Science","MIT Press",2009,3,"CS-A3"),
("9780134685991","Effective Java","Joshua Bloch","Computer Science","Addison-Wesley",2018,2,"CS-A4"),
]
for isbn,title,author,cat,pub,year,copies,rack in books:
    c.execute("""INSERT OR IGNORE INTO books(isbn,title,author,category_id,publisher,publication_year,copies_total,copies_available,location_rack,description,status)
                 VALUES(?,?,?,?,?,?,?,?,?,?,?)""",(isbn,title,author,cats[cat],pub,year,copies,copies,rack,"Sample library book","available"))
c.commit(); c.close()
print("Demo data ready.")
