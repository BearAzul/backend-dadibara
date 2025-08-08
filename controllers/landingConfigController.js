import LandingConfig from "../models/LandingConfigModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";

export const getLandingConfig = asyncHandler(async (req, res) => {
  const config = await LandingConfig.findOne();
  res.status(200).json(config || {});
});

export const updateLandingConfig = asyncHandler(async (req, res) => {
  const { namaOrganisasi, tagline, aboutUsParagraphs } = req.body;
  let config = await LandingConfig.findOne();

  if (!config) {
    config = new LandingConfig();
  }

  config.namaOrganisasi = namaOrganisasi;
  config.tagline = tagline;

  if (aboutUsParagraphs) {
    config.aboutUsParagraphs = aboutUsParagraphs.split(",,");
  } else {
    config.aboutUsParagraphs = [];
  }

  if (req.files) {
    if (req.files.logoDadiBara) {
      config.logoDadiBara = req.files.logoDadiBara[0].path;
    }
    if (req.files.logoDesaBaru) {
      config.logoDesaBaru = req.files.logoDesaBaru[0].path;
    }
  }

  const updatedConfig = await config.save();
  res.status(200).json(updatedConfig);
});
