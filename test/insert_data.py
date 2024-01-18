import psycopg2
import json

# 数据库连接配置
user = "default"
password = "KvlIpQrW1Au8"
host = "ep-divine-voice-31206558.us-east-1.postgres.vercel-storage.com"
port = "5432"
dbname = "verceldb"
db_url = f"postgres://{user}:{password}@{host}:{port}/{dbname}"

# 读取JSON文件
with open(r'./gpts_image_dict.json', 'r') as file:
    data = json.load(file)

# with open(r'./data.json', 'r') as file:
#     data_demo = json.load(file)

# 打印data
new_data = []
for key, value in data.items():
    temp = {}
    temp['uuid'] = key
    temp['org_id'] = '0'
    temp['name'] = value['title']
    temp['description'] = value['intro']
    temp['avatar_url'] = value['image_url']
    temp['short_url'] = value['openai_url']
    temp['author_id'] = ''
    temp['author_name'] = ''
    temp['created_at'] = "2024-01-18T12:00:00Z"
    temp['updated_at'] = "2024-01-18T12:00:00Z"
    temp['detail'] = json.dumps(value)
    temp['index_updated_at'] = 0
    temp['is_recommended'] = False
    temp['sort'] = 0
    temp['rating'] = 0
    new_data.append(temp)
print("new_data:", len(new_data))
data = new_data
# 插入数据到数据库的函数
def insert_data():
    conn = None
    try:
        # 连接数据库
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()

        # 开始事务
        for i in range(0, len(data), 100):
            # 插入数据到gpts表
            query = '''
            INSERT INTO gpts (
                uuid, org_id, name, description, avatar_url, short_url,
                author_id, author_name, created_at, updated_at, detail,
                index_updated_at, is_recommended, sort, rating
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
            )
            '''
            data_tuples = [
                (
                    item['uuid'], item['org_id'], item['name'], item['description'],
                    item['avatar_url'], item['short_url'], item['author_id'], item['author_name'],
                    item['created_at'], item['updated_at'], json.dumps(item['detail']),
                    item['index_updated_at'], item['is_recommended'], item['sort'], item['rating']
                )
                for item in data[i:i+100]
            ]
            try:
                cur.executemany(query, data_tuples)
                print("插入成功一条:", query)
            except Exception as e:
                print(e)
                print("插入失败一条:", query)
            # 提交事务
            conn.commit()
            print(f"成功插入 {len(data_tuples)} 条记录")
        cur.close()

    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
        # if conn is not None:
        #     conn.rollback()

    finally:
        if conn is not None:
            conn.close()

# 执行插入操作
insert_data()