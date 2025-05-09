-- Data for alerts
INSERT INTO `alerts` VALUES
  (1, '2025-05-05 19:46:09 CET', '200 Response OK', 'rt_scheduler__admin__search__RMD56793154b4eab8f20_at_1746470662_9.2', 'Low', 'Open', 1746470769, NULL, 'http://localhost:8000/en-US/app/search/search?s=%2FservicesNS%2Fadmin%2Fsearch%2Fsaved%2Fsearches%2F200+Response+OK&display.page.search.mode=verbose&dispatch_sample_ratio=1&workload_pool=&q=search+index%3D*+200&earliest=-60m%40m&latest=now&display.page.search.tab=events&sid=rt_scheduler__admin__search__RMD56793154b4eab8f20_at_1746470662_9.2', '2025-05-05 22:25:52'),
  (2, '2025-05-05 19:45:12 CET', '200 Response OK', 'rt_scheduler__admin__search__RMD56793154b4eab8f20_at_1746470662_9.1', 'Low', 'Open', 1746470712, NULL, 'http://localhost:8000/en-US/app/search/search?s=%2FservicesNS%2Fadmin%2Fsearch%2Fsaved%2Fsearches%2F200+Response+OK&display.page.search.mode=verbose&dispatch_sample_ratio=1&workload_pool=&q=search+index%3D*+200&earliest=-60m%40m&latest=now&display.page.search.tab=events&sid=rt_scheduler__admin__search__RMD56793154b4eab8f20_at_1746470662_9.1', '2025-05-05 22:25:52'),
  (3, '2025-05-05 19:44:37 CET', '200 Response OK', 'rt_scheduler__admin__search__RMD56793154b4eab8f20_at_1746470662_9.0', 'Low', 'Open', 1746470677, NULL, 'http://localhost:8000/en-US/app/search/search?s=%2FservicesNS%2Fadmin%2Fsearch%2Fsaved%2Fsearches%2F200+Response+OK&display.page.search.mode=verbose&dispatch_sample_ratio=1&workload_pool=&q=search+index%3D*+200&earliest=-60m%40m&latest=now&display.page.search.tab=events&sid=rt_scheduler__admin__search__RMD56793154b4eab8f20_at_1746470662_9.0', '2025-05-05 22:25:52'),
  (4, '2025-05-05 18:31:25 CET', 'License_Change', 'rt_scheduler__admin__search__RMD580deccdbc990ec3d_at_1746463905_1.0', 'Info', 'Open', 1746466285, NULL, 'http://localhost:8000/en-US/app/search/search?s=%2FservicesNS%2Fadmin%2Fsearch%2Fsaved%2Fsearches%2FLicense_Change&display.page.search.mode=verbose&dispatch_sample_ratio=1&workload_pool=&q=search+sourcetype%3D%22splunkd.log%22++%0A%7C+search+%22Added+type%3Denterprise+license%22+OR+%22license+stack%22+OR+%22Successfully+added+license%22%0A%7C+table+_time%2C+host%2C+user%2C+log_level%2C+component%2C+message%0A%7C+sort+-_time&earliest=-60m%40m&latest=now&display.page.search.tab=events&sid=rt_scheduler__admin__search__RMD580deccdbc990ec3d_at_1746463905_1.0', '2025-05-05 22:25:52'),
  (5, '2025-05-05 18:31:06 CET', '500_Sever_Error', 'rt_scheduler__admin__search__RMD5debffd32c8e40b0d_at_1746463905_2.0', 'High', 'Open', 1746466266, NULL, 'http://localhost:8000/en-US/app/search/search?s=%2FservicesNS%2Fadmin%2Fsearch%2Fsaved%2Fsearches%2F500_Sever_Error&display.page.search.mode=verbose&dispatch_sample_ratio=1&workload_pool=&q=search+index%3D*+500&earliest=-60m%40m&latest=now&display.page.search.tab=events&sid=rt_scheduler__admin__search__RMD5debffd32c8e40b0d_at_1746463905_2.0', '2025-05-05 22:25:52');

-- Data for chat_rooms
INSERT INTO `chat_rooms` VALUES
  (1, 'rt_scheduler__admin__search__RMD56793154b4eab8f20_at_1746470662_9.2', '2025-05-05 22:26:04');

-- Data for chat_messages
INSERT INTO `chat_messages` VALUES
  (1, 1, 'Current User', '', '2025-05-05 22:26:09', '[]'),
  (2, 1, 'Current User', '', '2025-05-05 22:33:48', '[]');

-- Data for chat_attachments
INSERT INTO `chat_attachments` VALUES
  (1, 1, 1, 'MADJOURamirEtudesEnFrance.png', '/home/amirmadjour/Haris/uploads/1746483969917-0ofkhxj', 'image/png', 3001538, '2025-05-05 22:26:09'),
  (2, 2, 1, 'Plan du Campus.jpg', '/home/amirmadjour/Haris/uploads/1746484428845-t6eopov', 'image/jpeg', 2311933, '2025-05-05 22:33:48');

-- Data for team_members
INSERT INTO `team_members` VALUES
  (1, 'Ahmed', 'ahmed@example.com'),
  (2, 'Hassan', 'hassan@example.com'),
  (3, 'Faisal Ghamdi', 'faisal@example.com');

