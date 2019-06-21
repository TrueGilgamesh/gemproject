const mongoose = require('mongoose');
require('./models');

const User = mongoose.model('User');
const GemType = mongoose.model('GemType');
const Gem = mongoose.model('Gem');
const Settings = mongoose.model('Settings');

async function checkMaster() {
  const mastersCount = await User.countDocuments({ master: true });
  return mastersCount > 0;
}

function populateUserData(query, allGems, extraData) {
  const gemsCountOptions = { path: 'hasGems' };

  if (!allGems) {
    gemsCountOptions.match = { status: 'confirmed' };
  }

  query
    .populate('favorites.gemType')
    .populate(gemsCountOptions)
    .populate('minedGems');

  if (extraData) {
    query
      .populate({
        path: 'assignedGems',
        match: { status: 'assigned' },
        populate: ['type', 'miner']
      })
      .populate({
        path: 'receivedGems',
        match: { status: 'confirmed' },
        populate: ['type']
      })
      .populate({
        path: 'minedGemsList',
        populate: ['type']
      });
  }

  return query;
}

function populateGemData(query) {
  return query
    .populate('type', 'name')
    .populate('miner', 'name')
    .populate('owner', 'name')
    .populate('assignedBy', 'name');
}

exports.connect = async function(dbConfig) {
  await mongoose.connect(dbConfig.connectionString, dbConfig.connectionOptions);
  return await checkMaster();
};

exports.createSettings = async function() {
  const settingsObject = await Settings.findOne();

  if (!settingsObject) {
    await Settings.create({});
  }
};

exports.getSettings = async function() {
  return await Settings.findOne();
};

exports.createUser = async function(login, password, name, role, master) {
  return await User.create({
    login,
    password,
    name,
    role,
    master: master === true ? true : false,
    registrationDate: new Date()
  });
};

exports.checkUser = async function(login, password) {
  const user = await User.findOne({ login, deleted: { $ne: true } });
  return user !== null && (await user.checkPassword(password)) === true;
};

exports.beginSession = async function(login) {
  const user = await User.findOne({ login });

  if (user) {
    await user.setNewSessionId();
    user.authorizationDate = new Date();
    await user.save();
    return user.sessionId;
  } else {
    return null;
  }
};

exports.getUserBySessionId = async function(sessionId) {
  return await populateUserData(User.findOne({ sessionId }), false, true);
};

exports.getUsers = async function(filter, allGems) {
  const condition = { deleted: { $ne: true } };

  if (filter) {
    if (filter.deleted === true) {
      condition.deleted = true;
    }

    if (filter.name) {
      condition.name = { $regex: '.*' + filter.name + '.*', $options: 'i' };
    }

    if (filter.role) {
      condition.role = filter.role;
    }
  }

  return await populateUserData(User.find(condition), allGems).sort('name');
};

exports.getUser = async function(id) {
  return await populateUserData(User.findById(id), false, true);
};

exports.deleteUser = async function(id) {
  const user = await User.findById(id);

  if (user) {
    user.deleted = !user.deleted;
    user.deletionDate = new Date();
    await user.save();
    return true;
  } else {
    return false;
  }
};

exports.updateUser = async function(
  id,
  login,
  password,
  name,
  master,
  deleted
) {
  const user = await User.findById(id);

  if (user) {
    user.login = login;
    user.password = password;
    user.name = name;

    if (master !== undefined) {
      user.master = master;
    }

    if (deleted !== undefined) {
      user.deleted = deleted;
    }

    await user.save();
    return true;
  } else {
    return false;
  }
};

exports.getGemTypes = async function(filter) {
  const condition = { deleted: { $ne: true } };

  if (filter) {
    if (filter.deleted === true) {
      condition.deleted = true;
    }

    if (filter.name) {
      condition.name = { $regex: '.*' + filter.name + '.*', $options: 'i' };
    }
  }

  return await GemType.find(condition).sort('name');
};

exports.createGemTypes = async function(gemTypes) {
  return await GemType.create(gemTypes);
};

exports.getGemType = async function(id) {
  return await GemType.findById(id);
};

exports.updateGemType = async function(id, name, deleted) {
  const getType = await GemType.findById(id);

  if (getType) {
    getType.name = name;
    getType.deleted = deleted;
    await getType.save();
    return true;
  } else {
    return false;
  }
};

exports.deleteGemType = async function(id) {
  const gemType = await GemType.findById(id);

  if (gemType) {
    gemType.deleted = !gemType.deleted;
    await gemType.save();
    return true;
  } else {
    return false;
  }
};

exports.setFavorites = async function(id, preferences) {
  return await User.updateOne({ _id: id }, { favorites: preferences });
};

exports.addGems = async function(gems, miner) {
  let newGems = [];
  const mineDate = new Date();

  gems.forEach(gem => {
    for (let i = 1; i <= gem.number; i++) {
      newGems.push({
        type: gem.type,
        miner,
        status: 'not assigned',
        mineDate: mineDate
      });
    }
  });

  return await Gem.create(newGems);
};

exports.getGems = async function(filter) {
  const condition = { deleted: { $ne: true } };

  if (filter) {
    if (filter.deleted === 'on') {
      condition.deleted = true;
    }

    if (filter.status) {
      condition.status = filter.status;
    }

    if (filter.owner) {
      condition.owner = filter.owner;
    }

    if (filter.miner) {
      condition.miner = filter.miner;
    }

    if (filter.assignedBy) {
      condition.assignedBy = filter.assignedBy;
    }

    if (filter.assignDateBegin) {
      condition.assignDate = { $gte: new Date(filter.assignDateBegin) };
    }

    if (filter.assignDateEnd) {
      const assignDateEnd = new Date(filter.assignDateEnd);
      assignDateEnd.setHours(23, 59, 59, 999);
      condition.assignDate = { $lte: assignDateEnd };
    }

    if (filter.confirmDateBegin) {
      condition.confirmDate = { $gte: new Date(filter.confirmDateBegin) };
    }

    if (filter.confirmDateEnd) {
      const confirmDateEnd = new Date(filter.confirmDateEnd);
      confirmDateEnd.setHours(23, 59, 59, 999);
      condition.confirmDate = { $lte: confirmDateEnd };
    }

    if (filter.type) {
      condition.type = filter.type;
    }
  }

  return await populateGemData(Gem.find(condition));
};

exports.getGem = async function(id) {
  return await populateGemData(Gem.findById(id));
};

exports.deleteGem = async function(id) {
  const gem = await Gem.findById(id);

  if (gem) {
    gem.deleted = !gem.deleted;
    await gem.save();
    return true;
  } else {
    return false;
  }
};

exports.assignGems = async function(assignment, assignedBy) {
  const assignDate = new Date();

  const updateData = assignment.map(a => ({
    _id: a.gem,
    owner: a.owner,
    status: 'assigned',
    assignDate,
    assignedBy,
    manualAssignment: a.manualAssignment
  }));

  const promises = assignment.map(async a => {
    const doc = await Gem.findById(a.gem);

    if (doc) {
      doc.owner = a.owner;
      doc.status = 'assigned';
      doc.assignDate = assignDate;
      doc.assignedBy = assignedBy;
      doc.manualAssignment = a.manualAssignment;
      await doc.save();
    }
  });

  await Promise.all(promises);
};

exports.updateSettings = async function(settings) {
  await Settings.updateOne(settings);
};

exports.confirmGems = async function(gems) {
  await Gem.updateMany(
    { _id: { $in: gems } },
    { status: 'confirmed', confirmDate: new Date() }
  );
};

exports.getStatuses = async function() {
  return [
    { _id: 'not assigned', name: 'Не назначена' },
    { _id: 'assigned', name: 'Назначена' },
    { _id: 'confirmed', name: 'Подтверждена' }
  ];
};

exports.closeSession = async function(id) {
  const user = await User.findById(id);

  if (user) {
    user.sessionId = '';
    await user.save();
  }
};
